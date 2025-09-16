はい、ご主人様。承知いたしました。
これまでにご提供いただいた「要件定義書」「データベース設計書」「開発ログ」の全てを統合し、プロジェクト『皆の秘密基地』の集大成として、`Architecture.md`を作成しました。

-----

# Architecture Specification: Minna no Himitsu Kichi

# アーキテクチャ設計書：皆の秘密基地

## 1\. Overview

## 1\. 概要

This document outlines the system architecture of the web application "Minna no Himitsu Kichi." The application is designed based on a modern three-tier architecture, consisting of a Frontend (Client), a Backend (Server), and a Database. This architecture was intentionally chosen to ensure high maintainability, scalability, and a clear separation of concerns.
本文書は、Webアプリケーション「皆の秘密基地」のシステムアーキテクチャを概説するものです。本アプリケーションは、フロントエンド（クライアント）、バックエンド（サーバー）、データベースから成る、モダンな3層アーキテクチャに基づき設計されています。この構成は、高い保守性、拡張性、そして明確な関心の分離を確保するために意図的に採用されました。

The development process involved an initial rapid implementation followed by a significant refactoring phase. This evolution transformed the application from a monolithic structure into a modular and robust system, which is the current state described in this document.
開発プロセスは、初期の迅速な実装フェーズを経て、大規模なリファクタリングフェーズへと移行しました。この進化により、アプリケーションはモノリシックな構造から、モジュール化された堅牢なシステムへと生まれ変わっており、本文書ではその最終的な姿を記述します。

## 2\. Design Philosophy

## 2\. 設計思想

  * **Separation of Concerns (SoC):** The frontend, backend, and database are completely decoupled. This allows for independent development, testing, and deployment of each part. The backend was further refactored to separate routing logic (`routes`), business logic (`controllers`/handlers), and data access logic (`models`).
    **関心の分離:** フロントエンド、バックエンド、データベースは完全に分離されています。これにより、各パーツの独立した開発、テスト、デプロイが可能です。バックエンドはさらに、ルーティング (`routes`)、ビジネスロジック (`controllers`/ハンドラ)、データアクセス (`models`) を分離するリファクタリングが実施されました。
  * **Maintainability & Scalability:** By modularizing components and centralizing logic like error handling, the codebase is kept easy to understand and modify. The database schema is designed with indexes to handle future data growth.
    **保守性と拡張性:** コンポーネントをモジュール化し、エラーハンドリングのようなロジックを集約することで、コードベースは理解しやすく、変更が容易に保たれています。データベーススキーマは、将来のデータ増加に対応できるようインデックスが設計されています。
  * **Security by Design:** All API endpoints handling user data are protected by JWT authentication. Strict data isolation is enforced at the database query level to ensure users can only access their own data.
    **セキュリティ・バイ・デザイン:** ユーザーデータを扱う全てのAPIエンドポイントはJWT認証によって保護されます。データベースのクエリレベルで厳格なデータ分離が強制され、ユーザーが自身のデータにのみアクセスできることを保証します。

## 3\. System Architecture Diagram

## 3\. システム構成図

```mermaid
graph TD
    A[User's Browser] -- HTTPS --> B(Nginx Reverse Proxy);
    B -- Port 80/443 --> C{/api/*};
    B -- Port 80/443 --> D[Static Files <br> (React Build)];
    C -- HTTP --> E[Backend: Node.js/Express <br> (PM2 Managed)];
    E <--> F[Database: PostgreSQL];

    subgraph "Frontend"
        D
    end

    subgraph "Backend"
        E
    end

    subgraph "Database"
        F
    end

    subgraph "Server (ConoHa VPS)"
        B
        C
        E
        F
    end
```

## 4\. Frontend Architecture

## 4\. フロントエンドアーキテクチャ

  * **Technology Stack:** React.js, Material-UI
    **技術スタック:** React.js, Material-UI
  * **Component Structure:** The initial monolithic `Dashboard.js` component was refactored into a collection of smaller, single-responsibility components (e.g., `TodoList`, `EventCalendar`, `DashboardSummary`). This significantly improves reusability and maintainability.
    **コンポーネント構造:** 初期のモノリシックな`Dashboard.js`は、機能ごとに小さな単一責務のコンポーネント（例: `TodoList`, `EventCalendar`, `DashboardSummary`）にリファクタリングされました。これにより、再利用性と保守性が大幅に向上しています。
  * **State Management:** Primarily uses React's built-in state management (`useState`, `useEffect`). A global notification system was implemented using the Context API to provide consistent user feedback.
    **状態管理:** 主にReactの組み込み状態管理（`useState`, `useEffect`）を使用。グローバルな通知システムは、一貫したユーザーフィードバックを提供するためにContext APIを用いて実装されました。
  * **Styling:** Utilizes Material-UI for a consistent and professional look and feel, enabling rapid development of a responsive UI.
    **スタイリング:** Material-UIを活用し、一貫性のあるプロフェッショナルなデザインを実現。レスポンシブUIの迅速な開発を可能にしています。
  * **Testing:** Jest and React Testing Library are used for UI regression testing, simulating user interactions to ensure components behave as expected.
    **テスト:** JestとReact Testing Libraryを用い、UI回帰テストを実施。ユーザーの操作をシミュレートし、コンポーネントが期待通りに動作することを保証します。

## 5\. Backend Architecture

## 5\. バックエンドアーキテクチャ

  * **Technology Stack:** Node.js, Express.js
    **技術スタック:** Node.js, Express.js
  * **Directory Structure & Pattern:** The backend follows a Model-Route-Controller (MRC) like pattern, enforced through refactoring:
    **ディレクトリ構造とパターン:** リファクタリングを経て、Model-Route-Controller (MRC) に近いパターンを採用しています。
      * `routes/`: Defines API endpoints and maps them to handler functions.
        APIエンドポイントを定義し、ハンドラ関数にマッピングします。
      * `models/`: Contains all database interaction logic, abstracting SQL queries away from the route handlers.
        全てのデータベース対話ロジックを格納し、SQLクエリをルートハンドラから抽象化します。
      * `middleware/`: Houses shared logic, most notably the centralized error handler and authentication checks.
        共有ロジック、特に中央集権的なエラーハンドラと認証チェックを配置します。
  * **API Design:** A RESTful API design is adopted, using standard HTTP methods (GET, POST, PUT, DELETE) for CRUD operations.
    **API設計:** RESTful API設計を採用し、CRUD操作には標準的なHTTPメソッド（GET, POST, PUT, DELETE）を使用します。
  * **Authentication:** Implemented using JSON Web Tokens (JWT). The login endpoint issues a token, which must be included in the `Authorization` header for all subsequent requests to protected routes.
    **認証:** JSON Web Token (JWT) を用いて実装。ログインエンドポイントがトークンを発行し、以降の保護されたルートへのリクエストには`Authorization`ヘッダーにトークンを含める必要があります。
  * **Error Handling:** A centralized error-handling middleware catches all errors passed via `next(error)`, ensuring consistent and secure error responses across the entire API.
    **エラーハンドリング:** 中央集権的なエラーハンドリングミドルウェアが`next(error)`で渡された全てのエラーを捕捉し、API全体で一貫性のある安全なエラーレスポンスを保証します。
  * **Testing:** Jest and Supertest are used for API regression testing, covering success cases, failure cases, input validation, and security aspects like data isolation.
    **テスト:** JestとSupertestを用い、API回帰テストを実施。成功ケース、失敗ケース、入力バリデーション、データ分離のようなセキュリティ側面をカバーします。

## 6\. Database Architecture

## 6\. データベースアーキテクチャ

  * **Technology:** PostgreSQL
    **技術:** PostgreSQL
  * **Schema Overview:** The schema is composed of 6 main tables: `users`, `todos`, `todo_categories`, `events`, `transactions`, and `categories`. All tables are linked to the `users` table via a `user_id` foreign key to enforce data isolation.
    **スキーマ概要:** スキーマは`users`, `todos`, `todo_categories`, `events`, `transactions`, `categories`の主要6テーブルで構成されます。全てのテーブルは`user_id`外部キーを介して`users`テーブルにリンクされ、データ分離を強制します。
  * **Data Isolation:** Every table containing user-specific data has a `user_id` column. All backend queries are required to include a `WHERE user_id = ?` clause to ensure users can never access data belonging to others.
    **データ分離:** ユーザー固有データを含む全てのテーブルは`user_id`カラムを持ちます。バックエンドの全クエリは`WHERE user_id = ?`句を含むことが必須とされ、ユーザーが他人のデータにアクセスできないことを保証します。
  * **Performance:** Indexes are strategically placed on foreign keys and columns frequently used in `WHERE` clauses (e.g., `transaction_date`, `is_completed`) to optimize query performance for common operations like fetching monthly summaries or upcoming events.
    **パフォーマンス:** 月次サマリーや今後の予定の取得といった一般的な操作のクエリパフォーマンスを最適化するため、外部キーや`WHERE`句で頻繁に使用されるカラム（例: `transaction_date`, `is_completed`）に戦略的にインデックスが配置されています。

## 7\. Deployment Architecture

## 7\. デプロイアーキテクチャ

  * **Infrastructure:** ConoHa VPS
    **インフラストラクチャ:** ConoHa VPS
  * **Web Server:** Nginx is used as a reverse proxy. It serves the static files of the React application and forwards all API requests (prefixed with `/api`) to the backend Node.js server.
    **Webサーバー:** Nginxをリバースプロキシとして使用。Reactアプリケーションの静的ファイルを提供し、`/api`で始まる全てのAPIリクエストをバックエンドのNode.jsサーバーに転送します。
  * **Process Management:** The Node.js application is managed by PM2. This ensures the application runs continuously and is automatically restarted in case of a crash or server reboot.
    **プロセス管理:** Node.jsアプリケーションはPM2によって管理されます。これにより、アプリケーションが継続的に実行され、クラッシュやサーバー再起動の際にも自動的に再起動されることが保証されます。
  * **Security:** The server is hardened by disabling root login via SSH and configuring the `ufw` firewall to only allow necessary traffic (SSH, HTTP, HTTPS).
    **セキュリティ:** SSH経由のrootログインを無効化し、`ufw`ファイアウォールで必要なトラフィック（SSH, HTTP, HTTPS）のみを許可するように設定することで、サーバーは要塞化されています。