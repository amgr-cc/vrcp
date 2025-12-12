import fs from 'fs';
import path from 'path';

const CONFIG = {
  appName: 'VRC-Pocket',
  developerName: 'kitRinor',
  contactInfo: 'contact@ktrn.dev',
  repoUrl: 'https://github.com/kitRinor/vrcp',
  lastUpdated: new Date().toISOString().split('T')[0],
};

const OUTPUT_PATH = path.join(__dirname, '../PrivacyPolicy.md');

// --- 本文 ---
const content = `# Privacy Policy (プライバシーポリシー)

**Last Updated:** ${CONFIG.lastUpdated}

## 日本語 (Japanese)

**${CONFIG.appName}** (以下、本アプリ) は、**${CONFIG.developerName}** (以下、開発者) が開発・公開している、VRChatユーザー向けの非公式コンパニオンアプリです。
本アプリにおける利用者の個人情報の取り扱いについて、以下の通りプライバシーポリシーを定めます。

### 1. 収集する情報とその利用目的

#### 1.1 VRChatアカウント情報
本アプリを利用するためには、VRChatアカウントでのログインが必要です。
入力されたログイン情報（ユーザー名、パスワード、二要素認証コード）は、**VRChat公式APIサーバーとの通信（認証）のみ**に使用されます。

* これらの情報が**開発者のサーバーや、第三者のサーバーに送信されることは一切ありません。**
* ログイン情報は、端末内の安全な領域（iOSのKeychain、AndroidのKeystoreを用いた暗号化ストレージ）にのみ保存され、アプリを削除すると消去されます。

#### 1.2 アプリ内のキャッシュデータ
フレンドリスト、ワールド情報、アバター情報などの取得したデータは、アプリの動作を高速化するために利用者の端末内に一時的に保存（キャッシュ）されます。これらが外部へ送信されることはありません。

### 2. 外部への通信
本アプリは、以下の通信先とのみ通信を行います。

1.  **VRChat API (\`api.vrchat.cloud\`)**: アプリの全機能（ログイン、フレンド確認等）のため。
2.  **GitHub / Expo Updates**: アプリの更新確認およびアップデートデータの取得のため。

開発者が利用者の操作ログや行動履歴を収集・追跡する機能（Google Analytics等）は搭載していません。

### 3. 免責事項
本アプリはVRChat社が提供する公式アプリではありません。
本アプリの利用により生じたトラブル（アカウントの制限、停止など）や損失について、開発者は一切の責任を負いかねます。ご利用は自己責任でお願いいたします。

### 4. お問い合わせ
本アプリのプライバシーポリシーに関するお問い合わせは、以下の連絡先までお願いいたします。

* **Contact / Issues**: ${CONFIG.contactInfo}
* **Repository**: ${CONFIG.repoUrl}

---

## English

**${CONFIG.appName}** (hereinafter referred to as "this App") is an unofficial companion app for VRChat users, developed by **${CONFIG.developerName}**.
This Privacy Policy describes how your personal information is handled in this App.

### 1. Information Collection and Use

#### 1.1 VRChat Account Credentials
To use this App, you must log in with your VRChat account.
The login credentials you enter (username, password, 2FA code) are used **solely for communication with the official VRChat API.**

* These credentials are **NEVER sent to the developer's servers or any third-party servers.**
* Login information is stored only on your device using secure encryption (iOS Keychain / Android Keystore via Expo SecureStore) and is deleted when you uninstall the app.

#### 1.2 Cached Data
Data retrieved such as friend lists, worlds, and avatar information is temporarily stored (cached) on your device to improve app performance. This data is not transmitted externally.

### 2. External Communication
This App communicates only with the following endpoints:

1.  **VRChat API (\`api.vrchat.cloud\`)**: To provide app functionality.
2.  **GitHub / Expo Updates**: To check for and download app updates.

This App does not contain any tracking features (such as Google Analytics) that collect user usage logs or behavioral history.

### 3. Disclaimer
This App is not an official product of VRChat Inc.
The developer assumes no responsibility for any trouble (e.g., account suspension) or loss caused by the use of this App. Please use it at your own risk.

### 4. Contact
If you have any questions regarding this Privacy Policy, please contact:

* **Contact / Issues**: ${CONFIG.contactInfo}
* **Repository**: ${CONFIG.repoUrl}
`;

// --- 書き込み実行 ---
try {
  fs.writeFileSync(OUTPUT_PATH, content);
  console.log(`✅ Generated PRIVACY.md (Date: ${CONFIG.lastUpdated})`);
} catch (error) {
  console.error('❌ Failed to generate PRIVACY.md', error);
  process.exit(1);
}