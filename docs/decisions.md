# Architecture decisions

The supplied product vision is the source of truth. The first release focuses on local service businesses and booked appointments. The system keeps `organization_id` and `workspace_id` on business records. An organization membership grants access to its workspaces; approval rights are restricted by role.

The target API is a FastAPI service, with SQLAlchemy models designed to work with PostgreSQL. SQLite will allow local development without Docker. Clerk is the planned sign-in provider; the API will verify session tokens and store its own organization roles. The web app uses Next.js with TypeScript. The current frontend is an interactive concept and uses sample data until the API is implemented and connected.

Approval is deliberately separate from external execution. Later channel integrations will consume approved actions only, with budget caps and a durable workflow. A pending URL import is a request record; a worker will perform the website crawl and versioned extraction in the next milestone.

Before a production deployment, add Alembic migrations, PostgreSQL row-level safeguards, a dedicated crawler with restricted egress, queue/workflow processing, secrets management, operational telemetry, and channel-specific consent checks.
