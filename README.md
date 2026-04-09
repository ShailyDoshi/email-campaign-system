# Email Campaign System

This is a premium Laravel Email Campaign System built for a technical assignment.

## Tech Stack
- **Laravel 12/13**
- **Inertia.js**
- **React**
- **TailwindCSS**
- **Laravel Horizon**
- **Redis** (Required for queues)

## Features
- **Contact Management**: CRUD operations for subscribers.
- **Contact Lists**: Group contacts into many-to-many lists.
- **Campaign Management**:
    - Multi-list targeting.
    - Automatic recipient resolution (unique contacts only).
    - Skip unsubscribed contacts automatically.
- **Queue Architecture**:
    - Every campaign dispatches jobs to a **dedicated queue** (e.g., `campaign-1`).
    - Monitored real-time via **Laravel Horizon**.
- **Modern UI**: Built with React and premium design elements.

## Setup Instructions

1. **Clone the repository** (if not already done).
2. **Install Dependencies**:
   ```bash
   composer install
   npm install
   ```
3. **Environment Setup**:
   - Copy `.env.example` to `.env`.
   - Configure your `DB_*` settings.
   - Configure your `REDIS_*` settings (Essential for Horizon).
   - Ensure `QUEUE_CONNECTION=redis` and `REDIS_CLIENT=predis` (if using Laragon/Windows).
4. **Database & Seeding**:
   ```bash
   php artisan key:generate
   php artisan migrate --seed
   ```
5. **Run Development Servers**:
   - In terminal 1 (Vite & Server): `npm run dev`
   - In terminal 2 (Queue Worker/Horizon): `php artisan horizon`

## How it Works
1. **Create Contacts** and assign them to **Contact Lists**.
2. **Create a Campaign** and select one or more Contact Lists.
3. **View the Campaign Details** and click "Initialize Sending".
4. The system will resolve unique active contacts, create recipient records, and dispatch jobs.
5. **Monitor Progress** on the Campaign Details page or via the Horizon dashboard at `/horizon`.


