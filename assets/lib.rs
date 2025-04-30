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

    #[derive(Default)]
    #[ink(storage)]
    /// A contract module for managing players and in-game assets.
    pub struct Assets {
        /// Registered players and their associated data.
        /// Each entry maps a player's `AccountId` to:
        /// - Their current balance.
        /// - A list of owned assets, represented as strings (e.g., "cod_firegun_9" where `9` is the quantity).
        players: Mapping<AccountId, (Balance, Vec<String>)>,

        /// Available game assets and their corresponding prices.
        /// Keys are asset identifiers (e.g., "cod_firegun") and values are their price in the contract's currency.
        assets: Mapping<String, Balance>,
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
        #[ink(message, payable)]
        pub fn register_player(&mut self) {
            // Get the players account
            let account_id = self.env().caller();
            self.players.insert(&account_id, &(0, Vec::<String>::new()));
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
        #[ink(message)]
        pub fn remove_asset(&mut self, asset: String, count: i64) {
            let account_id = self.env().caller();
            self.modify_assets(account_id, asset, count.neg(), false);
        }

        /// Gift an asset to a specific player without charging them.
        #[ink(message)]
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
            if let Some((balance, mut current_assets)) = self.players.get(&account_id) {
                // Check if enough balance
                if should_pay && balance < asset_price {
                    return;
                }

                let new_balance = if should_pay {
                    balance - asset_price
                } else {
                    balance
                };

                let asset_prefix = asset.clone(); // e.g., cod_firegun
                let mut found = false;

                for i in 0..current_assets.len() {
                    if current_assets[i].starts_with(&asset_prefix) {
                        let parts: Vec<&str> = current_assets[i].split('_').collect();
                        if parts.len() == 3 {
                            if let Ok(current_count) = parts[2].parse::<i64>() {
                                let new_count = current_count + count_change;

                                if new_count <= 0 {
                                    current_assets.remove(i);
                                } else {
                                    let mut new_asset = String::from(parts[0]);
                                    new_asset.push('_');
                                    new_asset.push_str(parts[1]);
                                    new_asset.push('_');
                                    new_asset.push_str(&new_count.to_string());

                                    current_assets[i] = new_asset;
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

                    current_assets.push(asset_string);
                }

                self.players
                    .insert(account_id, &(new_balance, current_assets));
            }
        }
    }
}
