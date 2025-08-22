-- Pridėti trūkstamus stulpelius į reminders lentelę
ALTER TABLE reminders 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS shown_today BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_shown DATE;

-- Atnaujinti esamus priminimus su 'active' statusu
UPDATE reminders SET status = 'active' WHERE status IS NULL;

-- Sukurti indeksą status stulpeliui
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);

-- Sukurti indeksą shown_today stulpeliui
CREATE INDEX IF NOT EXISTS idx_reminders_shown_today ON reminders(shown_today);
