
# 🕹️ AssetVerse — Interoperable In-Game Assets Onchain

**Games are isolated environments where assets do not mix.**  
What if we could create a unified asset layer where players own and transfer their digital items across all the games they play?

**AssetVerse** is a smart contract protocol that allows game developers to register games onchain, and players to own, purchase, gift, and exchange in-game assets across multiple games — seamlessly.

---

## 🚀 Motivation

Most games today operate as isolated silos — your skins, trophies, weapons, and collectibles are locked inside each game. If you stop playing, your progress and possessions become meaningless.  
AssetVerse solves this by creating an open, composable asset system that lives onchain — accessible and interoperable across games.

---

## 🧩 Features

- ✅ **Create gaming identity** — Players generate a universal onchain account that holds assets and collectibles across all games.
- ✅ **Register your game** — Developers register their games to support interoperable asset mechanics.
- ✅ **Add assets** — Define game assets with a name and value, making them tradable onchain.
- ✅ **Purchase assets** — Players buy assets with token balances, with asset ownership stored onchain.
- ✅ **Gift assets** — Send assets to other players without charge.
- ✅ **Exchange assets across games** — Exchange assets between different games as long as they make economic sense (value-aware).
- ✅ **View balance and assets** — Track all asset holdings and token balances tied to a gaming identity.

---

## 🔧 Tech Stack

- **ink!** smart contracts on the **Polkadot/Substrate** ecosystem  
- **Rust** for contract logic  
- **TypeScript & TailwindCSS** for frontend (optional UI layer)  
- Deployed on local Substrate node for demonstration

```
**Bob** account (a pre-funded test account) was used internally to deploy and interact with contracts.  
```


---

## 🧪 Usage

To interact with AssetVerse:

1. Deploy the contract on a Substrate-compatible chain.
2. Create a player account via `create_player(name)`.
3. Register your game via `register_game(game_name)`.
4. Add game assets via `add_asset(game_name, asset_name, price)`.
5. Players can now buy, gift, or exchange assets.

---

## 📡 Future Work

In future versions, we plan to support **cross-chain asset transfer** using **ISMP (Interoperable State Machine Protocol)** — enabling assets to move across chains, not just games.

---

## 🏁 Conclusion

AssetVerse lays the foundation for an open, game-agnostic asset ecosystem.  
By enabling true ownership and transferability of in-game items, we give players more power and games more depth.
