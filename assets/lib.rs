// Copyright (c) 2024 Algorealm, Inc.

#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod assets {
    use ink::{
        prelude::string::{String, ToString},
        prelude::vec::Vec,
        storage::Mapping,
    };

    /// Event emitted when a new player account is successfully created.
    #[ink(event)]
    pub struct PlayerCreated {
        /// The account ID of the newly created player.
        #[ink(topic)]
        account: AccountId,

        /// The in-game name chosen by the player.
        name: String,
    }

    /// Event emitted when a new in-game asset is registered on-chain.
    #[ink(event)]
    pub struct AssetCreated {
        /// The game to which the asset belongs.
        game: String,

        /// The name of the asset added (e.g., weapon, skin, item).
        #[ink(topic)]
        name: String,

        /// The asset's price in native token units.
        price: Balance,
    }

    /// Emitted when a player purchases an asset from the game store.
    #[ink(event)]
    pub struct AssetPurchased {
        /// The account that made the purchase.
        #[ink(topic)]
        account: AccountId,

        /// The name of the asset purchased.
        asset: String,

        /// The quantity of the asset purchased.
        count: u64,

        /// The total price paid for the assets.
        total_price: Balance,
    }

    /// Emitted when a player gifts an asset to another player.
    #[ink(event)]
    pub struct AssetGifted {
        /// The sender's account.
        #[ink(topic)]
        from: AccountId,

        /// The receiver's account.
        #[ink(topic)]
        to: AccountId,

        /// The asset being gifted.
        asset: String,

        /// The quantity of the asset gifted.
        count: u64,
    }

    /// Emitted when a player exchanges one asset for another.
    #[ink(event)]
    pub struct AssetExchanged {
        /// The account that initiated the exchange.
        #[ink(topic)]
        account: AccountId,

        /// The asset being given away.
        from_asset: String,

        /// The asset being received.
        to_asset: String,

        /// The quantity of the asset given.
        from_count: i64,

        /// The quantity of the asset received.
        to_count: i64,

        /// Any balance refunded to the user due to excess value.
        refund: Balance,
    }

    /// Emitted when a player's asset count is modified (manually or through gameplay).
    #[ink(event)]
    pub struct AssetModified {
        /// The account whose asset was modified.
        #[ink(topic)]
        account: AccountId,

        /// The asset affected.
        asset: String,

        /// The updated quantity after modification.
        new_count: i64,

        /// Whether the asset count was increased (`true`) or decreased (`false`).
        increased: bool,
    }

    /// Custom errors that can be returned by the contract methods.
    #[derive(Debug, PartialEq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum ContractError {
        /// The specified asset could not be found.
        AssetNotFound,

        /// The specified game has no registered assets.
        GameWithoutAssets,

        /// The player does not have enough balance to complete the action.
        InsufficientBalance,

        /// The specified player could not be found in storage.
        PlayerNotFound,

        /// The player does not have enough units of the asset to proceed.
        InsufficientAssetCount,
    }

    /// The main contract for managing game players and in-game assets.
    #[derive(Default)]
    #[ink(storage)]
    pub struct Assets {
        /// Mapping from a player's `AccountId` to their `Player` data.
        ///
        /// Each player has:
        /// - A `name`: their in-game identity.
        /// - A `balance`: their current token balance.
        /// - A list of `assets`: strings representing assets with quantities (e.g., "cod_firegun_9").
        players: Mapping<AccountId, Player>,

        /// Mapping from a game to its assets
        assets: Mapping<String, Vec<(String, Balance)>>,

        /// Games available onchain
        games: Vec<String>,
    }

    /// Data structure representing an individual player.
    #[derive(Default)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub struct Player {
        /// The player’s chosen name across games.
        name: String,

        /// Player’s available token balance.
        balance: Balance,

        /// List of owned assets with quantity encoded in the string (e.g., "cod_firegun_9").
        ///
        /// This flat structure allows flexible handling of asset counts without a custom struct.
        assets: Vec<String>,
    }

    impl Assets {
        /// Constructor that initializes the assetverse contract
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                players: Mapping::default(),
                assets: Mapping::default(),
                games: Vec::new(),
            }
        }

        /// Register a playing account across the network.
        /// Players are endowed with 1M units of tokens at registration to buy game assets.
        #[ink(message, payable)]
        pub fn register_player(&mut self, name: String) {
            // Get caller
            let account_id = self.env().caller();

            // Create a new player with default values
            let player = Player {
                name: name.clone(),
                balance: 1_000_000,
                assets: Vec::new(),
            };

            // Emit event
            self.env().emit_event(PlayerCreated {
                account: account_id.clone(),
                name,
            });

            self.players.insert(&account_id, &player);
        }

        /// Returns a player account related to an `AccountId`.
        #[ink(message, payable)]
        pub fn auth_player(&mut self) -> Option<Player> {
            // Get caller
            let account_id = self.env().caller();
            self.players.get(&account_id)
        }

        /// Returns the registered games
        #[ink(message, payable)]
        pub fn games(&self) -> Vec<String> {
            self.games.clone()
        }

        /// Register an asset
        #[ink(message, payable)]
        pub fn register_asset(&mut self, game: String, name: String, price: Balance) {
            // Fetch current assets for the game
            let mut asset_list = self.assets.get(&game).unwrap_or_default();

            // Append the new asset
            asset_list.push((name.clone(), price));

            // Store the updated list back in the mapping
            self.assets.insert(&game, &asset_list);

            // Store the game entry
            self.games.push(game.clone());

            // Emit event
            self.env().emit_event(AssetCreated { game, name, price });
        }

        /// Get assets belonging to a game
        #[ink(message, payable)]
        pub fn assets(&self, game: String) -> Option<Vec<(String, Balance)>> {
            self.assets.get(&game)
        }

        /// Buy units of an asset, deducting its price from the player's balance.
        #[ink(message, payable)]
        pub fn purchase_asset(
            &mut self,
            game: String,
            asset: String,
            count: u64,
        ) -> Result<(), ContractError> {
            let account_id = self.env().caller();

            // Validate count
            if count <= 0 {
                return Err(ContractError::InsufficientAssetCount);
            }

            // Retrieve asset price from game
            let asset_price = match self.assets.get(&game) {
                Some(asset_list) => {
                    let mut price: Option<Balance> = None;
                    for (a_name, a_price) in asset_list.iter() {
                        if *a_name == asset {
                            price = Some(*a_price);
                            break;
                        }
                    }
                    match price {
                        Some(p) => p,
                        None => return Err(ContractError::AssetNotFound),
                    }
                }
                None => return Err(ContractError::GameWithoutAssets),
            };

            // Load player
            let mut player = match self.players.get(&account_id) {
                Some(p) => p,
                None => return Err(ContractError::PlayerNotFound),
            };

            // Check for sufficient balance
            if player.balance < (asset_price * count as u128) {
                return Err(ContractError::InsufficientBalance);
            }

            // Deduct payment
            player.balance -= asset_price * count as u128;

            // Update or add asset string (e.g., firegun_5)
            let mut found = false;

            for i in 0..player.assets.len() {
                if player.assets[i].starts_with(&asset) {
                    let parts: Vec<&str> = player.assets[i].split('_').collect();
                    if parts.len() == 2 {
                        if let Ok(current_count) = parts[1].parse::<u64>() {
                            let new_count = current_count + count;

                            let mut updated = String::from(asset.as_str());
                            updated.push('_');
                            updated.push_str(&new_count.to_string());

                            player.assets[i] = updated;
                            found = true;
                            break;
                        }
                    }
                }
            }

            // If asset not found, add it
            if !found {
                let mut new_asset = String::from(asset.as_str());
                new_asset.push('_');
                new_asset.push_str(&count.to_string());

                player.assets.push(new_asset);
            }

            // Store player
            self.players.insert(&account_id, &player);

            // Emit Event
            self.env().emit_event(AssetPurchased {
                account: account_id,
                asset,
                count,
                total_price: asset_price * count as u128,
            });

            Ok(())
        }

        /// Gift an asset to a specific player without charging them.
        #[ink(message, payable)]
        pub fn gift_asset(
            &mut self,
            receiver: AccountId,
            asset: String,
            amount: u64,
        ) -> Result<(), ContractError> {
            // Get sender
            let sender = self.env().caller();
            let mut sender_player = match self.players.get(&sender) {
                Some(p) => p,
                None => return Err(ContractError::PlayerNotFound),
            };

            // Check if sender has enough of the asset
            let mut found_sender_asset = false;

            for i in 0..sender_player.assets.len() {
                if sender_player.assets[i].starts_with(&asset) {
                    let parts: Vec<&str> = sender_player.assets[i].split('_').collect();
                    if parts.len() == 2 {
                        if let Ok(current_count) = parts[1].parse::<u64>() {
                            if current_count < amount {
                                return Err(ContractError::InsufficientAssetCount);
                            }

                            let new_count = current_count - amount;

                            if new_count == 0 {
                                sender_player.assets.remove(i);
                            } else {
                                let mut updated = String::from(asset.as_str());
                                updated.push('_');
                                updated.push_str(&new_count.to_string());
                                sender_player.assets[i] = updated;
                            }

                            found_sender_asset = true;
                            break;
                        }
                    }
                }
            }

            if !found_sender_asset {
                return Err(ContractError::AssetNotFound);
            }

            // Get receiver
            let mut receiver_player = match self.players.get(&receiver) {
                Some(p) => p,
                None => return Err(ContractError::PlayerNotFound),
            };

            // Add to receiver's asset count or insert new
            let mut found_receiver_asset = false;

            for i in 0..receiver_player.assets.len() {
                if receiver_player.assets[i].starts_with(&asset) {
                    let parts: Vec<&str> = receiver_player.assets[i].split('_').collect();
                    if parts.len() == 2 {
                        if let Ok(current_count) = parts[1].parse::<u64>() {
                            let new_count = current_count + amount;

                            let mut updated = String::from(asset.as_str());
                            updated.push('_');
                            updated.push_str(&new_count.to_string());

                            receiver_player.assets[i] = updated;
                            found_receiver_asset = true;
                            break;
                        }
                    }
                }
            }

            if !found_receiver_asset {
                let mut new_asset = String::from(asset.as_str());
                new_asset.push('_');
                new_asset.push_str(&amount.to_string());
                receiver_player.assets.push(new_asset);
            }

            // Store updates
            self.players.insert(&sender, &sender_player);
            self.players.insert(&receiver, &receiver_player);

            // Emit Event
            self.env().emit_event(AssetGifted {
                from: sender,
                to: receiver,
                asset,
                count: amount,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn exchange_asset(
            &mut self,
            asset_give: String,
            units_give: i64,
            asset_take: String,
            units_take: i64,
        ) -> Result<(), ContractError> {
            let account_id = self.env().caller();

            // Get asset prices from all games
            let mut price_give: Option<Balance> = None;
            let mut price_take: Option<Balance> = None;

            for game in &self.games {
                if let Some(list) = self.assets.get(game) {
                    for (name, price) in list {
                        if name == asset_give {
                            price_give = Some(price);
                        }
                        if name == asset_take {
                            price_take = Some(price);
                        }
                    }
                }
            }

            let price_give = price_give.ok_or(ContractError::AssetNotFound)?;
            let price_take = price_take.ok_or(ContractError::AssetNotFound)?;

            let total_give = price_give * (units_give as u128);
            let total_take = price_take * (units_take as u128);

            if total_give < total_take {
                return Err(ContractError::InsufficientBalance);
            }

            let mut player = self
                .players
                .get(&account_id)
                .ok_or(ContractError::PlayerNotFound)?;

            let mut found_give = false;

            for i in 0..player.assets.len() {
                if let Some((name, qty)) = Self::parse_asset(&player.assets[i]) {
                    if name == asset_give {
                        if qty < units_give {
                            return Err(ContractError::InsufficientAssetCount);
                        }

                        // Adjust or remove the asset_give
                        if qty == units_give {
                            player.assets.remove(i);
                        } else {
                            let mut new_str = asset_give.clone();
                            new_str.push('_');
                            new_str.push_str(&(qty - units_give).to_string());
                            player.assets[i] = new_str;
                        }

                        found_give = true;
                        break;
                    }
                }
            }

            if !found_give {
                return Err(ContractError::AssetNotFound);
            }

            // Add or increase the asset_take
            let mut found_take = false;

            for i in 0..player.assets.len() {
                if let Some((name, qty)) = Self::parse_asset(&player.assets[i]) {
                    if name == asset_take {
                        let mut new_str = asset_take.clone();
                        new_str.push('_');
                        new_str.push_str(&(qty + units_take).to_string());
                        player.assets[i] = new_str;
                        found_take = true;
                        break;
                    }
                }
            }

            if !found_take {
                let mut new_str = asset_take.clone();
                new_str.push('_');
                new_str.push_str(&units_take.to_string());
                player.assets.push(new_str);
            }

            // Refund balance if value_give > value_take
            if total_give > total_take {
                player.balance += total_give - total_take;
            }

            self.players.insert(account_id, &player);

            // Emit Event
            self.env().emit_event(AssetExchanged {
                account: account_id,
                from_asset: asset_give,
                to_asset: asset_take,
                from_count: units_give,
                to_count: units_take,
                refund: total_give - total_take,
            });
            Ok(())
        }

        /// Modify assets owned by a player
        #[ink(message)]
        pub fn modify_asset(
            &mut self,
            asset: String,
            count: i64,
            increase: bool,
        ) -> Result<(), ContractError> {
            // Get contract caller
            let caller = self.env().caller();
            let mut player = self
                .players
                .get(caller)
                .ok_or(ContractError::PlayerNotFound)?;

            let mut found = false;
            let mut n_count = 0;

            for i in 0..player.assets.len() {
                if let Some(pos) = player.assets[i].rfind('_') {
                    let (name, qty_str) = player.assets[i].split_at(pos);
                    let qty_str = &qty_str[1..]; // remove underscore
                    if name == asset {
                        let existing_count = qty_str
                            .parse::<i64>()
                            .map_err(|_| ContractError::InsufficientAssetCount)?;

                        let new_count = if increase {
                            existing_count + count
                        } else {
                            existing_count - count
                        };

                        n_count = new_count;

                        if new_count < 0 {
                            return Err(ContractError::InsufficientAssetCount);
                        } else if new_count == 0 {
                            player.assets.remove(i);
                        } else {
                            let mut new_string = String::from(name);
                            new_string.push('_');
                            new_string.push_str(&new_count.to_string());
                            player.assets[i] = new_string;
                        }

                        found = true;
                        break;
                    }
                }
            }

            if !found {
                if increase {
                    let mut new_string = String::from(asset.clone());
                    new_string.push('_');
                    new_string.push_str(&count.to_string());
                    player.assets.push(new_string);
                } else {
                    return Err(ContractError::InsufficientAssetCount);
                }
            }

            self.players.insert(caller, &player);

            // Emit Event
            //  self.env().emit_event(AssetPurchased {
            //     account: account_id,
            //     asset,
            //     count,
            //     total_price: asset_price * count as u128,
            // });

            // Emit Event
            self.env().emit_event(AssetModified {
                account: caller,
                asset,
                new_count: n_count,
                increased: increase,
            });

            Ok(())
        }

        /// Helper function
        fn parse_asset(asset: &str) -> Option<(String, i64)> {
            let mut split = asset.rsplitn(2, '_');
            let qty_str = split.next()?;
            let name_str = split.next()?;
            let qty = qty_str.parse::<i64>().ok()?;
            Some((name_str.to_string(), qty))
        }
    }
}
