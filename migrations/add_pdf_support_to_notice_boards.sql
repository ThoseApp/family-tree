-- Add PDF support to notice_boards table
-- This migration adds support for PDF attachments to notice boards

-- Add pdf_url column to store the URL of uploaded PDF
ALTER TABLE notice_boards
ADD COLUMN pdf_url TEXT;

-- Add pdf_name column to store the original name of the PDF file
ALTER TABLE notice_boards
ADD COLUMN pdf_name TEXT;

-- Add index for PDF queries (helpful for searching notices with PDFs)
CREATE INDEX IF NOT EXISTS idx_notice_boards_pdf_url ON notice_boards(pdf_url);

-- Add a comment to the table explaining the new fields
COMMENT ON COLUMN notice_boards.pdf_url IS 'URL of the PDF attachment for this notice board';
COMMENT ON COLUMN notice_boards.pdf_name IS 'Original filename of the PDF attachment';
