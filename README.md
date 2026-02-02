# Worktime Aggregator

## 概要
コマンドライン引数で指定した年月に対応する CSV ファイルを扱い、集計結果を出力するアプリケーションです。

## 現状の機能
- コマンドライン引数から年・月を取得 (`parseArgs`)
- CSV ファイル名生成 (`generateCsvFilenames`)
- 初期設定（社員ID、暫定パス）を config.js で管理

## 未実装・今後追加予定
- CSV コピー＆UTF-8変換 (`copyCSVFiles`)
- CSV 集計 (`aggregateCSV`)
- 集計結果の出力 (`writeOutput`)
- パスや社員IDを `.env` から取得

> ※ 現状リモートには最小構成のみ push されています。未実装の機能はローカルブランチで開発中です。
