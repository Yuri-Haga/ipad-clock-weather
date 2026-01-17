# iPad 時計＆天気ウィジェット

iPadのステージマネージャー用に作った、時計と天気を表示するWebアプリ。

## 機能

- **日付・時刻**: 1秒ごとに更新
- **現在の天気**: 気温、体感温度、天気アイコン
- **時間別予報**: 今後6時間分

## 技術

- HTML/CSS/JavaScript（フレームワークなし）
- [Open-Meteo API](https://open-meteo.com/)（無料、APIキー不要）
- GPS（Geolocation API）で位置を自動取得

## 使い方

1. GitHub PagesのURLをiPadのSafariで開く
2. 位置情報の許可を与える
3. ステージマネージャーでウィンドウを右上に配置

## ファイル構成

```
index.html  - メインHTML
style.css   - ダークテーマのスタイル
app.js      - 時計更新・天気取得のロジック
```

## 天気の更新間隔

- 30分ごとに自動で再取得
