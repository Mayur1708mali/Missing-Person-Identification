# Missing Person Identification System — Architecture

> A full-stack missing person reporting and AI-powered facial recognition search platform.

---

## 1. High-Level System Architecture

```mermaid
flowchart TB
    subgraph Clients["Client Layer"]
        Android["📱 Android App\n(Native Kotlin — Scaffold)"]
        Web["🌐 React Frontend\n(Vite + TypeScript + TailwindCSS)"]
    end

    subgraph Backend["Backend Layer — FastAPI"]
        API["FastAPI Application\n(Uvicorn ASGI Server · Port 8000)"]
        CORS["CORS Middleware"]
        ErrHandler["Global Exception Handlers"]
        StaticMedia["Static Media Mount\n(/media/*)"]
    end

    subgraph Services["Service Layer"]
        AuthSvc["Auth Service\n(Google OAuth Verification)"]
        FaceSvc["Face Service\n(DeepFace + FaceNet)"]
        FileSvc["File Service\n(Upload / Validate / Store)"]
        PersonSvc["Missing Person Service\n(CRUD + Search + Stats)"]
    end

    subgraph DataLayer["Data Layer"]
        PG["PostgreSQL + pgvector\n(Port 5432)"]
        MediaDisk["Media Storage\n(/app/media · Docker Volume)"]
    end

    subgraph External["External Services"]
        Google["Google OAuth2 API\n(Token Verification)"]
    end

    Web -- "REST API (Axios)\n/api/*" --> API
    Android -. "REST API (Planned)\n/api/*" .-> API

    API --> CORS
    API --> ErrHandler
    API --> StaticMedia

    API --> AuthSvc
    API --> FaceSvc
    API --> FileSvc
    API --> PersonSvc

    AuthSvc -- "httpx async" --> Google
    FaceSvc --> PG
    PersonSvc --> PG
    AuthSvc --> PG
    FileSvc --> MediaDisk
    StaticMedia --> MediaDisk

    style Clients fill:#e8f5e9,stroke:#2e7d32
    style Backend fill:#e3f2fd,stroke:#1565c0
    style Services fill:#fff3e0,stroke:#e65100
    style DataLayer fill:#fce4ec,stroke:#c62828
    style External fill:#f3e5f5,stroke:#6a1b9a
```

---

## 2. Docker Infrastructure

```mermaid
flowchart LR
    subgraph DockerCompose["Docker Compose"]
        subgraph AlwaysOn["Default Profile"]
            DB["🗄️ db\nankane/pgvector:latest\nPort 5432:5432\nHealthcheck: pg_isready"]
        end

        subgraph FullProfile["Profile: full"]
            BE["⚙️ backend\nPython 3.11-slim\nPort 8000:8000\ndepends_on: db (healthy)"]
            FE["🖥️ frontend\nNginx\nPort 5173:80\ndepends_on: backend"]
        end
    end

    subgraph Volumes["Docker Volumes"]
        PGData["📦 pgdata\n/var/lib/postgresql/data"]
        MediaVol["📦 media_data\n/app/media"]
    end

    subgraph EnvConfig[".env Configuration"]
        ENV["POSTGRES_USER\nPOSTGRES_PASSWORD\nGOOGLE_CLIENT_ID\nJWT_SECRET_KEY\nFRONTEND_URL\nMEDIA_DIR"]
    end

    DB --> PGData
    BE --> MediaVol
    BE -- "asyncpg\ndb:5432" --> DB
    FE -- "Nginx proxy\nlocalhost:8000" --> BE
    ENV -.-> DB
    ENV -.-> BE

    style AlwaysOn fill:#e8f5e9,stroke:#2e7d32
    style FullProfile fill:#e3f2fd,stroke:#1565c0
    style Volumes fill:#fff9c4,stroke:#f57f17
    style EnvConfig fill:#f3e5f5,stroke:#6a1b9a
```

---

## 3. Backend Architecture (FastAPI)

```mermaid
flowchart TD
    subgraph Routers["API Routers (/api)"]
        R_Auth["🔐 /auth\nPOST /google"]
        R_Persons["👤 /missing-persons\nGET / POST / PUT\nPATCH /status\nDELETE\nGET /statistics"]
        R_Upload["📤 /upload\nPOST (multipart)"]
        R_Search["🔍 /search\nPOST /face"]
        R_Admin["🛡️ /admin\nGET /users\nPATCH /users/:id/role"]
    end

    subgraph Dependencies["Dependency Injection"]
        GetDB["get_db()\nAsyncSession"]
        GetUser["get_current_user()\nJWT → User"]
        ReqAuth["require_authenticated()"]
        ReqAdmin["require_admin()\nRole Check"]
    end

    subgraph ServiceLayer["Services"]
        S_Auth["auth_service\n• verify_google_token\n• get_or_create_user\n• get_user_by_id"]
        S_Face["face_service\n• generate_embedding\n• store_embedding\n• process_and_store_face\n• search_by_face"]
        S_File["file_service\n• validate_image\n• save_upload\n• get_file_path\n• delete_file"]
        S_Person["missing_person_service\n• create / list / get / update\n• update_case_status\n• delete / get_statistics"]
    end

    subgraph Utils["Utilities"]
        JWT["jwt.py\n• create_access_token\n• decode_access_token"]
    end

    subgraph Middleware["Middleware"]
        EH["error_handler\n• global_exception_handler\n• integrity_error_handler"]
    end

    subgraph Models["ORM Models (SQLAlchemy)"]
        M_User["User\n(users table)"]
        M_Person["MissingPerson\n(missing_persons table)"]
        M_Embed["FaceEmbedding\n(face_embeddings table)\nVector(128)"]
    end

    subgraph Schemas["Pydantic Schemas"]
        Sch_Person["MissingPerson\nCreate / Update / Response\nStatusUpdate / ListResponse"]
        Sch_User["UserResponse\nUserUpdateRole"]
    end

    R_Auth --> S_Auth
    R_Auth --> JWT
    R_Persons --> S_Person
    R_Persons --> S_Face
    R_Upload --> S_File
    R_Search --> S_Face
    R_Search --> S_File
    R_Admin --> M_User

    GetUser --> JWT
    GetUser --> S_Auth

    S_Auth --> M_User
    S_Person --> M_Person
    S_Face --> M_Embed
    S_Face --> M_Person
    S_File --> MediaDisk["Disk (media/)"]

    R_Persons --> GetDB
    R_Persons --> GetUser
    R_Persons --> ReqAdmin
    R_Search --> GetDB
    R_Search --> GetUser
    R_Upload --> GetUser
    R_Admin --> GetDB
    R_Admin --> ReqAdmin

    style Routers fill:#e3f2fd,stroke:#1565c0
    style Dependencies fill:#f1f8e9,stroke:#33691e
    style ServiceLayer fill:#fff3e0,stroke:#e65100
    style Models fill:#fce4ec,stroke:#c62828
    style Schemas fill:#e8eaf6,stroke:#283593
    style Utils fill:#f3e5f5,stroke:#6a1b9a
    style Middleware fill:#efebe9,stroke:#4e342e
```

---

## 4. Database Schema (Entity-Relationship)

```mermaid
erDiagram
    USERS {
        int id PK
        string email UK "indexed"
        string name
        string google_id UK
        string avatar_url "nullable"
        enum role "admin | user"
        datetime created_at "server default now()"
    }

    MISSING_PERSONS {
        int id PK
        string full_name "indexed"
        int age "nullable"
        date date_of_birth "nullable"
        enum gender "male | female | other"
        string photo_url "nullable"
        string last_seen_location
        date last_seen_date "nullable"
        float height "nullable"
        float weight "nullable"
        string distinguishing_marks "nullable"
        string reporter_contact "nullable"
        enum case_status "missing | found | under_investigation"
        int reported_by FK
        datetime created_at
        datetime updated_at
    }

    FACE_EMBEDDINGS {
        int id PK
        int missing_person_id FK UK "CASCADE delete"
        vector_128 embedding "pgvector Vector(128)"
    }

    USERS ||--o{ MISSING_PERSONS : "reports"
    MISSING_PERSONS ||--o| FACE_EMBEDDINGS : "has face"
```

---

## 5. Authentication & Authorization Flow

```mermaid
sequenceDiagram
    actor User
    participant Client as Web / Android Client
    participant API as FastAPI Backend
    participant Google as Google OAuth2 API
    participant DB as PostgreSQL
    participant JWT as JWT Utils

    Note over User,JWT: === Login Flow ===
    User->>Client: Click "Sign in with Google"
    Client->>Google: OAuth popup / redirect
    Google-->>Client: Google access_token
    Client->>API: POST /api/auth/google { token }

    API->>Google: GET /oauth2/v1/userinfo (Bearer token)
    Google-->>API: { sub, email, name, picture }

    API->>DB: SELECT * FROM users WHERE google_id = sub
    alt User Exists
        DB-->>API: User record
        API->>DB: UPDATE name, avatar_url
    else New User
        API->>DB: SELECT COUNT(*) FROM users
        alt First User
            API->>DB: INSERT (role = admin)
        else Subsequent User
            API->>DB: INSERT (role = user)
        end
    end

    API->>JWT: create_access_token({ sub: user.id, role })
    JWT-->>API: Signed JWT (HS256, 60min TTL)
    API-->>Client: { access_token, user }
    Client->>Client: Store in localStorage

    Note over User,JWT: === Authenticated Request ===
    Client->>API: GET /api/missing-persons (Authorization: Bearer JWT)
    API->>JWT: decode_access_token(token)
    JWT-->>API: { sub: user_id, role }
    API->>DB: SELECT * FROM users WHERE id = user_id
    DB-->>API: User record
    API->>API: Proceed with handler
    API-->>Client: Response data
```

---

## 6. Face Recognition Pipeline

```mermaid
flowchart TD
    subgraph Registration["📋 Case Registration Pipeline"]
        A1["User submits report\nwith photo"] --> A2["POST /api/upload\n(multipart/form-data)"]
        A2 --> A3["file_service.save_upload()\n• Validate type & size (≤5MB)\n• Generate UUID filename\n• Write to /media/"]
        A3 --> A4["POST /api/missing-persons\n(JSON + photo_url)"]
        A4 --> A5["missing_person_service\n.create_missing_person()"]
        A5 --> A6["face_service\n.process_and_store_face()"]
        A6 --> A7["DeepFace.represent()\nModel: FaceNet\nDetector: OpenCV"]
        A7 --> A8{"Face\ndetected?"}
        A8 -- Yes --> A9["128-dim embedding vector"]
        A9 --> A10["face_service.store_embedding()\nINSERT INTO face_embeddings"]
        A10 --> A11["✅ Case created\nwith face indexed"]
        A8 -- No --> A12["⚠️ Case created\nwithout embedding"]
    end

    subgraph SearchPipeline["🔍 Face Search Pipeline"]
        B1["User uploads query photo"] --> B2["POST /api/search/face\n(multipart + threshold + limit)"]
        B2 --> B3["file_service.validate_image()\nWrite temp file"]
        B3 --> B4["face_service.search_by_face()"]
        B4 --> B5["DeepFace.represent()\nGenerate query embedding"]
        B5 --> B6{"Face\ndetected?"}
        B6 -- Yes --> B7["pgvector cosine_distance\nquery against all embeddings\nWHERE distance < threshold"]
        B7 --> B8["JOIN missing_persons\nORDER BY distance ASC\nLIMIT N"]
        B8 --> B9["Calculate similarity %\n= (1 - distance) × 100"]
        B9 --> B10["🎯 Return matched persons\nwith similarity scores"]
        B6 -- No --> B11["❌ No face detected\nin uploaded image"]
        B2 --> B12["Cleanup: delete temp file"]
    end

    style Registration fill:#e8f5e9,stroke:#2e7d32
    style SearchPipeline fill:#e3f2fd,stroke:#1565c0
```

---

## 7. Frontend Architecture (React)

```mermaid
flowchart TD
    subgraph Providers["Provider Stack (main.tsx)"]
        P1["React.StrictMode"] --> P2["ErrorBoundary"]
        P2 --> P3["GoogleOAuthProvider"]
        P3 --> P4["BrowserRouter"]
        P4 --> P5["AuthProvider (Context)"]
        P5 --> P6["ToastProvider"]
        P6 --> AppShell
    end

    subgraph AppShell["App Shell"]
        Navbar["Navbar\n+ GoogleLoginButton"]
        Router["AppRouter"]
        Footer["Footer"]
    end

    subgraph Pages["Pages & Route Guards"]
        Router --> Home["/ → Home\n(Public)"]
        Router --> Browse["/browse → Browse\n(Public)"]
        Router --> Detail["/person/:id → PersonDetail\n(Public)"]
        Router --> PR1["ProtectedRoute"]
        PR1 --> Report["/report → Report\n(Authenticated)"]
        Router --> PR2["ProtectedRoute"]
        PR2 --> Search["/search → Search\n(Authenticated)"]
        Router --> AR["AdminRoute"]
        AR --> Admin["/admin → Admin\n(Admin Only)"]
    end

    subgraph Components["Shared Components"]
        PersonCard["PersonCard"]
        PhotoUpload["PhotoUpload\n(Drag & Drop)"]
        SearchResults["SearchResults\n(Similarity Badges)"]
        FilterBar["FilterBar"]
        Pagination["Pagination"]
        StatsCards["StatsCards"]
        UserTable["UserTable"]
        CaseTable["CaseTable"]
        ConfirmModal["ConfirmModal"]
    end

    subgraph APILayer["API Layer (Axios)"]
        Client["client.ts\n(Base URL + Interceptors)"]
        A_Admin["admin.ts\n• fetchStatistics\n• fetchAllUsers\n• updateUserRole\n• fetchAllCases"]
        A_Persons["missingPersons.ts\n• fetchMissingPersons\n• uploadPhoto\n• createMissingPerson\n• updateCaseStatus\n• deleteMissingPerson"]
        A_Search["search.ts\n• searchByFace"]
    end

    Browse --> PersonCard
    Browse --> FilterBar
    Browse --> Pagination
    Search --> PhotoUpload
    Search --> SearchResults
    Report --> PhotoUpload
    Admin --> StatsCards
    Admin --> UserTable
    Admin --> CaseTable
    Admin --> ConfirmModal

    Browse --> A_Persons
    Report --> A_Persons
    Search --> A_Search
    Admin --> A_Admin
    Admin --> A_Persons
    Detail --> Client

    A_Admin --> Client
    A_Persons --> Client
    A_Search --> Client

    Client -- "Authorization:\nBearer JWT" --> BackendAPI["FastAPI Backend\n(/api/*)"]

    style Providers fill:#f3e5f5,stroke:#6a1b9a
    style AppShell fill:#e8eaf6,stroke:#283593
    style Pages fill:#e3f2fd,stroke:#1565c0
    style Components fill:#fff3e0,stroke:#e65100
    style APILayer fill:#e8f5e9,stroke:#2e7d32
```

---

## 8. Complete Request Data Flow

```mermaid
flowchart LR
    subgraph Client["Client"]
        UserAction["User Action\n(Click / Submit)"]
    end

    subgraph FrontendFlow["Frontend (React)"]
        Page["Page Component\n(e.g. Report.tsx)"]
        Form["react-hook-form\n+ Zod Validation"]
        APIModule["API Module\n(Axios call)"]
        Interceptor["Request Interceptor\n(Attach JWT)"]
    end

    subgraph BackendFlow["Backend (FastAPI)"]
        CORSCheck["CORS Middleware"]
        DepInject["Dependency Injection\n(get_db + get_current_user)"]
        RouterHandler["Router Handler"]
        ServiceCall["Service Layer"]
        ORM["SQLAlchemy ORM"]
    end

    subgraph Data["Data Stores"]
        PostgreSQL["PostgreSQL\n+ pgvector"]
        Disk["File System\n(media/)"]
    end

    UserAction --> Page
    Page --> Form
    Form --> APIModule
    APIModule --> Interceptor
    Interceptor --> CORSCheck
    CORSCheck --> DepInject
    DepInject --> RouterHandler
    RouterHandler --> ServiceCall
    ServiceCall --> ORM
    ORM --> PostgreSQL
    ServiceCall --> Disk

    PostgreSQL --> ORM
    ORM --> ServiceCall
    ServiceCall --> RouterHandler
    RouterHandler --> APIModule
    APIModule --> Page
    Page --> UserAction

    style Client fill:#fff9c4,stroke:#f57f17
    style FrontendFlow fill:#e3f2fd,stroke:#1565c0
    style BackendFlow fill:#fff3e0,stroke:#e65100
    style Data fill:#fce4ec,stroke:#c62828
```

---

## 9. Role-Based Access Control (RBAC)

```mermaid
flowchart TD
    subgraph Roles["User Roles"]
        Public["🌐 Public\n(Unauthenticated)"]
        AuthUser["👤 Authenticated User"]
        AdminUser["🛡️ Administrator\n(First registered user)"]
    end

    subgraph PublicEndpoints["Public Access"]
        E1["GET /health"]
        E2["GET /media/*"]
        E3["GET /api/missing-persons"]
        E4["GET /api/missing-persons/:id"]
        E5["POST /api/auth/google"]
    end

    subgraph UserEndpoints["Authenticated Access"]
        E6["POST /api/upload"]
        E7["POST /api/missing-persons"]
        E8["PUT /api/missing-persons/:id\n(own reports only)"]
        E9["POST /api/search/face"]
    end

    subgraph AdminEndpoints["Admin Access"]
        E10["GET /api/missing-persons/statistics"]
        E11["PATCH /api/missing-persons/:id/status"]
        E12["DELETE /api/missing-persons/:id"]
        E13["GET /api/admin/users"]
        E14["PATCH /api/admin/users/:id/role"]
        E15["PUT /api/missing-persons/:id\n(any report)"]
    end

    Public --> PublicEndpoints
    AuthUser --> PublicEndpoints
    AuthUser --> UserEndpoints
    AdminUser --> PublicEndpoints
    AdminUser --> UserEndpoints
    AdminUser --> AdminEndpoints

    style Roles fill:#f3e5f5,stroke:#6a1b9a
    style PublicEndpoints fill:#e8f5e9,stroke:#2e7d32
    style UserEndpoints fill:#e3f2fd,stroke:#1565c0
    style AdminEndpoints fill:#fce4ec,stroke:#c62828
```

---

## 10. Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Android** | Kotlin · AppCompat · ConstraintLayout | Native mobile client (scaffold) |
| **Frontend** | React 18 · TypeScript · Vite 8 | Web SPA |
| **Styling** | TailwindCSS 3 | Utility-first CSS |
| **Forms** | react-hook-form · Zod | Validation & state |
| **Auth (Client)** | @react-oauth/google | Google OAuth popup |
| **HTTP Client** | Axios | API communication |
| **Backend** | FastAPI 0.115 · Python 3.11 | REST API server |
| **ASGI Server** | Uvicorn 0.30 | Production server |
| **ORM** | SQLAlchemy 2.0 (async) | Database abstraction |
| **DB Driver** | asyncpg | Async PostgreSQL |
| **Database** | PostgreSQL + pgvector | Relational + vector storage |
| **Migrations** | Alembic | Schema versioning |
| **Face AI** | DeepFace + FaceNet | 128-dim embedding extraction |
| **Vector Search** | pgvector cosine_distance | Similarity matching |
| **Auth (Server)** | python-jose (JWT) · httpx | Token signing & Google verification |
| **File Upload** | python-multipart | Multipart form handling |
| **Containerization** | Docker Compose | Multi-service orchestration |
