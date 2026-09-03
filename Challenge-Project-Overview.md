# Hollywood Studios Secure AI and Chain of Title

  **Company / Org:** Hollywood Studios 
  **Challenge Advisor:** Maher Hasan, [m@hollywoodstudios.ai](mailto:m@hollywoodstudios.ai)  
  **Challenge Advisor:** Sir Steven Saxton, [s@hollywoodstudios.ai](mailto:s@hollywoodstudios.ai)  
  **AI Studio Coach:** Ishan Patwardhan,
  [ishan.patwardhan@breakthroughtech.org](mailto:ishan.patwardhan@breakthroughtech.org)  
  **Program:** Break Through Tech AI Studio - Fall 2026

  ---

  ## 🏢 About Hollywood studios
  Hollywood Studios is building a secure AI platform for the creative economy that protects intellectual property, establishes provenance and chain of title, enables trusted      collaboration, and provides AI-powered tools and predictive intelligence to help move creative projects from development through financing, production, marketing, and distribution.



  ---

  ## 🎯 The Challenge
  ### Project Summary
  In this project, you will use proprietary provenance and interaction log data, public entertainment performance
  datasets (box office, audience demand signals), and creative asset metadata along with natural language processing,
  classification models, time-series analysis, and hybrid inference techniques to build components of Vault™ — a secure
   AI governance and provenance engine — and integrate them with CreativeOS™ for intelligent creative workflow
  management. This will help our company address the critical business problem of protecting intellectual property,
  maintaining verifiable chain of title, and enabling safe human-AI collaboration in the creative industries while
  accurately predicting commercial value (such as streaming licensing deals) in an AI-driven entertainment landscape.

  ### Success Criteria
  Success will be measured by the delivery of a functional prototype of the Vault™ + CreativeOS™ secure AI ecosystem
  with the following outcomes:

  - A working proof-of-concept demonstrating secure asset upload, AI-governed interaction logging, provenance tracking,
   and chain-of-title maintenance.
  - A functional Streaming Deals Prediction module that accurately projects licensing terms using public data + MSPF
  audience psychology.
  - Successful integration of the HollywoodMindLayer for creative intelligence.
  - Comprehensive documentation, clean code repository, and a live demo showing secure collaboration and commercial
  intelligence features.
  - Positive evaluation on technical quality, innovation, IP protection mechanisms, and usability.

  A successful outcome is a solid foundation that clearly demonstrates the core value of secure human-AI collaboration
  in creative industries.

  ### Stretch Goals
  - Stretch Goal 1: Implement a full AI-safe processing workspace with advanced access controls and real-time copyright
   integrity warnings.
  - Stretch Goal 2: Develop a graph database model for visualizing complex chain-of-title relationships and rights
  management.
  - Stretch Goal 3: Expand the Streaming Deals Prediction Engine with additional ML models and real-time trend
  injection capabilities.
  - Stretch Goal 4: Create a user interface prototype (web or desktop) for Vault™ and CreativeOS™ dual modes.
  - Stretch Goal 5: Research and prototype blockchain or distributed ledger integration for enhanced immutable
  provenance.

  ### Project Milestones
  Use these milestones to guide your work. Your team will create a GitHub Projects board to track tasks within each
  milestone.
  | Month | Milestone | Key Activities |
  |-------|-----------|----------------|
  | **September** | Foundations & Architecture | Complete requirements gathering, system architecture design, and core data modeling. Deliver a detailed technical specification for Vault™ (secure repository with provenance engine) and CreativeOS™ (AI orchestration layer), including the proprietary SQL schema, MSPF audience modeling, and integration points with the HollywoodMindLayer. Set up the development environment and initial Git repository. |
  | **October** | Core Build & Prediction Prototype | Implement core components including the AI governance and provenance tracking engine, basic read-only secure viewing, chain-of-title functionality, and the Streaming Deals Prediction Engine prototype. Integrate the Hollywood collective intelligence layer and conduct initial testing with sample creative assets and public entertainment datasets. |
  | **November** | Integration, Testing & Demo Delivery | Complete system integration between Vault™ and CreativeOS™, implement dual Secure/Inspire modes, add commercial intelligence features (deal prediction + audience analysis), perform end-to-end testing, and prepare documentation, a working demo, and a final report with stretch goal results.|

  > **Note for the team:** Please create a GitHub Projects board in this repository to break these milestones into
  weekly tasks. Go to the **Projects** tab → **New project** → Choose **Board** → Add columns for each month.

  ---

  ## 📊 Dataset
  **Name and Source:** IMDb Non-Commercial Datasets (title, ratings, crew, and episode data) + TMDB API (revenue,
  popularity signals, and streaming watch-provider data), supplemented by the project's curated `comp_references`
  benchmark database (~25 film/TV titles with budget tiers, domestic/international box office, platform, and audience
  demographics)  
  **Format:** IMDb: gzipped TSV files; TMDB: JSON via REST API; comp references: PostgreSQL (seeded from `schema.sql`)  
  **Size:** 1gb to 5gb  
  **Location:** IMDb: [datasets.imdbws.com](https://datasets.imdbws.com) • TMDB:
  [developer.themoviedb.org](https://developer.themoviedb.org/docs) (free API key required) • Comp references:
  `schema.sql` and `api/vault/_comp-references.ts` in this repository

  ### Key Details
  - IMDb provides seven TSV files (`title.basics`, `title.ratings`, `title.principals`, `name.basics`, etc.) covering
  millions of titles — you will need to filter and join these into a modeling-ready subset (e.g., feature films and
  series post-2010).
  - TMDB supplies the commercial signals IMDb lacks: budget, revenue, popularity trends, and which streaming platforms
  carry each title — these become the labels and demand features for the Streaming Deals Prediction module.
  - The in-repo `comp_references` table (25 curated titles, $40M–$952M box office range, tagged by
  genre/subgenre/budget tier/platform) is used to calibrate and sanity-check model predictions against known market
  outcomes.
  - Vault™ interaction data (view sessions, scroll depth, page-time analytics from `vault_view_sessions`) serves as the
   proprietary interaction-log component for provenance and engagement modeling.

  ---

  ## 🛠️  Suggested Approach

  **ML Problem Type:** Hybrid — (1) NLP/LLM-based text analysis and classification for script decomposition, genre
  detection, and dimension scoring (see the 3-pass Intelligence Pipeline in `docs/analysis-pipeline-architecture.md`);
  (2) supervised regression for streaming deal value / revenue prediction; (3) classification for platform fit
  (theatrical vs. streaming vs. hybrid); (4) time-series analysis of audience demand and popularity trend signals.

  **Recommended Libraries:**
  - pandas + NumPy (data wrangling of IMDb TSVs and TMDB JSON)
  - scikit-learn (regression, classification, model evaluation)
  - XGBoost / LightGBM (gradient-boosted models for deal prediction)
  - Hugging Face Transformers (NLP experimentation, embeddings)
  - matplotlib / seaborn (analysis and reporting visuals)
  - The existing platform stack for integration: TypeScript, React 19 + Vite, Vercel serverless functions, Neon
  PostgreSQL

  **Evaluation Metrics:**
  - RMSE / MAE and R² for revenue and licensing-value regression
  - Precision / Recall / F1 for platform-fit and genre classification
  - Calibration against the `comp_references` benchmarks (predicted vs. actual outcomes for the 25 comp titles)
  - Rubric alignment: the platform's existing 0–100 weighted dimension scoring (Coverage → Relativity → Greenlight) as
  a qualitative cross-check

  ---

  ## 📚 Resources to Get Started

  The following resources will help your team understand the problem space and potential technical approaches for this
  project:

  **Background Reading:**
  - `docs/analysis-pipeline-architecture.md` in this repo — the 3-pass LLM analysis pipeline (script decomposition →
  act-level analysis → genre-aware dimension scoring)
  - `schema.sql` in this repo — the Vault™ data model: encrypted scripts, provenance timestamps, share links, view
  sessions, chain-of-title tables
  - [OpenTimestamps](https://opentimestamps.org) — the blockchain proof-of-existence standard used by
  `vault_timestamps` for IP protection

  **Technical Tutorials:**
  - [scikit-learn User Guide](https://scikit-learn.org/stable/user_guide.html) — regression, classification, and model
  evaluation
  - [Hugging Face NLP Course](https://huggingface.co/learn) — free, hands-on NLP/transformers course
  - [pandas Getting Started](https://pandas.pydata.org/docs/getting_started/index.html) — loading and joining large TSV
   datasets
  - [TMDB API Getting Started](https://developer.themoviedb.org/docs/getting-started) — fetching revenue, popularity,
  and watch-provider data

  **Code Examples:**
  - This repository — key files: `api/vault/_genre-config.ts` (genre-calibrated scoring rubrics),
  `api/vault/_comp-references.ts` (benchmark comp database), `api/vault/_llm.ts` (pluggable LLM backend)
  - [IMDb Non-Commercial Datasets](https://datasets.imdbws.com) — includes data dictionary describing each TSV file

  **Other:**
  - [Neon PostgreSQL docs](https://neon.com/docs) and [Vercel Functions docs](https://vercel.com/docs/functions) — the
  deployment stack you'll integrate with

  *Feel free to explore beyond these, and share anything interesting you find with me!*

  ---

  ## 🤝 How We'll Work Together

  **Official check-ins:** During our biweekly 45-minute AI Studio Lab Section meeting block (2nd and 4th week of every
  month)

   **Other ways to reach out to me with questions:**
  * Email [s@hollywoodstudios.ai](mailto:s@hollywoodstudios.ai) and CC
  [m@hollywoodstudios.ai](mailto:m@hollywoodstudios.ai); please also copy your teammates and AI Studio Coach
  * I will aim to respond within 48 hours. Please reach out to your AI Studio Coach with urgent questions.

  **Recommended free coding / collaboration tools**
  * GitHub + GitHub Projects (repository, task board, code review)
  * VS Code with the Python and TypeScript extensions
  * Google Colab (free notebooks with GPU for ML experimentation)
  * Neon PostgreSQL free tier (matches the production database)
  * Discord + Zoom for team communication and check-ins

  ---

  ## 🚀 Getting Started

  1. **Review this overview document** and note any questions for our first meeting
  2. **Begin reviewing the dataset** using the link above
  3. **Read the GitHub Projects documentation**
  [here](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects)

  I'm excited to work with you!

  ---

  ## ❓ Questions?

  Please bring any questions to our first meeting during the week of August 24th (Break Through Tech's Bridge to Studio - Session C).
