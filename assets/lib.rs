// Copyright (c) 2024 Algorealm, Inc.

#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod assets {
    use core::ops::Neg;

    use ink::{
        prelude::string::{String, ToString},
        prelude::vec::Vec,
        storage::Mapping,
    };

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

        /// Mapping of available in-game assets to their price in tokens.
        ///
        /// Key: asset identifier (e.g., "cod_firegun").
        /// Value: cost of the asset in the game's native currency.
        assets: Mapping<String, Balance>,
    }

    /// Data structure representing an individual player.
    #[derive(Default)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub struct Player {
        /// The player’s chosen in-game name.
        name: String,

        /// Player’s available token balance.
        balance: Balance,

        /// List of owned assets with quantity encoded in the string (e.g., "cod_firegun_9").
        ///
        /// This flat structure allows flexible handling of asset counts without a custom struct.
        assets: Vec<String>,
    }

    impl Assets {
        /// Constructor that initializes the games asset contract
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                players: Mapping::default(),
                assets: Mapping::default(),
            }
        }

        /// Register a playing account
        /// Players are endowed with 1M units of tokens at registration
        #[ink(message, payable)]
        pub fn register_player(&mut self, name: String) {
            let account_id = self.env().caller();

            // Create a new player with default values
            let player = Player {
                name,
                balance: 1_000_000,
                assets: Vec::new(),
            };

            self.players.insert(&account_id, &player);
        }

        /// Get players
        #[ink(message, payable)]
        pub fn get_player(&mut self) -> Option<Player> {
            let account_id = self.env().caller();

            self.players.get(&account_id)
        }

        /// Register an asset
        #[ink(message, payable)]
        pub fn register_asset(&mut self, name: String, price: Balance) {
            // Insert into storage
            self.assets.insert(&name, &price);
        }

        /// Buy units of an asset, deducting its price from the player's balance.
        #[ink(message, payable)]
        pub fn purchase_asset(&mut self, asset: String, count: i64) {
            let account_id = self.env().caller();
            self.modify_assets(account_id, asset, count, true);
        }

        /// Remove units of an asset, without refunding or deducting money.
        #[ink(message, payable)]
        pub fn remove_asset(&mut self, asset: String, count: i64) {
            let account_id = self.env().caller();
            self.modify_assets(account_id, asset, count.neg(), false);
        }

        /// Gift an asset to a specific player without charging them.
        #[ink(message, payable)]
        pub fn gift_asset(&mut self, receiver: AccountId, asset: String, amount: i64) {
            self.modify_assets(receiver, asset, amount, false);
        }

        /// Internal utility that handles asset quantity and optionally deducts payment.
        fn modify_assets(
            &mut self,
            account_id: AccountId,
            asset: String,
            count_change: i64,
            should_pay: bool,
        ) {
            // Get asset price if payment is needed
            let asset_price = if should_pay {
                match self.assets.get(&asset) {
                    Some(price) => price,
                    None => return, // Asset doesn't exist
                }
            } else {
                0
            };

            // Get player data
            if let Some(mut player) = self.players.get(&account_id) {
                // Check if enough balance
                if should_pay && player.balance < asset_price {
                    return;
                }

                if should_pay {
                    player.balance -= asset_price;
                }

                let asset_prefix = asset.clone(); // e.g., cod_firegun
                let mut found = false;

                for i in 0..player.assets.len() {
                    if player.assets[i].starts_with(&asset_prefix) {
                        let parts: Vec<&str> = player.assets[i].split('_').collect();
                        if parts.len() == 3 {
                            if let Ok(current_count) = parts[2].parse::<i64>() {
                                let new_count = current_count + count_change;

                                if new_count <= 0 {
                                    player.assets.remove(i);
                                } else {
                                    let mut new_asset = String::from(parts[0]);
                                    new_asset.push('_');
                                    new_asset.push_str(parts[1]);
                                    new_asset.push('_');
                                    new_asset.push_str(&new_count.to_string());

                                    player.assets[i] = new_asset;
                                }

                                found = true;
                                break;
                            }
                        }
                    }
                }

                if !found && count_change > 0 {
                    let mut asset_string = String::from(asset_prefix);
                    asset_string.push('_');
                    asset_string.push_str(&count_change.to_string());

                    player.assets.push(asset_string);
                }

                self.players.insert(&account_id, &player);
            }
        }
    }
}
