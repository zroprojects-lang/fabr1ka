ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS products_services TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS content_pillars TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS posting_frequency TEXT DEFAULT '3x_semana';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS best_posting_time TEXT DEFAULT 'morning';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS factory_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  theme TEXT NOT NULL,
  context JSONB,
  status TEXT DEFAULT 'processing',
  total_formats INTEGER DEFAULT 0,
  completed_formats INTEGER DEFAULT 0,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS factory_outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES factory_batches(id) ON DELETE CASCADE,
  format TEXT NOT NULL,
  content JSONB NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_factory_batches_user
  ON factory_batches(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_factory_batches_status
  ON factory_batches(status);

CREATE INDEX IF NOT EXISTS idx_factory_outputs_batch
  ON factory_outputs(batch_id);

CREATE INDEX IF NOT EXISTS idx_factory_outputs_format
  ON factory_outputs(format);

ALTER TABLE factory_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own batches"
  ON factory_batches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create batches"
  ON factory_batches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view outputs of their batches"
  ON factory_outputs FOR SELECT
  USING (
    batch_id IN (
      SELECT id FROM factory_batches WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create outputs for their batches"
  ON factory_outputs FOR INSERT
  WITH CHECK (
    batch_id IN (
      SELECT id FROM factory_batches WHERE user_id = auth.uid()
    )
  );
