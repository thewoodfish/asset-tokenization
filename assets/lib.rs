// Copyright (c) 2024 Algorealm, Inc.

#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod assets {
    use ink::{
        storage::Mapping,
        prelude::string::String,
        prelude::vec::Vec
    };

    // The weight of an asset
    type Weight = u64;

    #[derive(Default)]
    #[ink(storage)]
    pub struct Assets {
        /// Players registered onchain and the games they're playing
        /// The players contains a mapping of the AccountId of the player and all it's accrued assets
        players: Mapping<AccountId, Vec<String>>,
        /// Mapping of each game assets to its weight
        /// The assets are usually prefixed with the name of the game e.g cod_firegun.
        assets: Mapping<String, Weight>
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

        /// Register a playing account onchain
        #[ink(message, payable)]
        pub fn register_player(&mut self) {
            // Get the players account
            let account_id = self.env().caller();
            self.players.insert(&account_id, &Vec::<String>::new());
        }
    }
}
