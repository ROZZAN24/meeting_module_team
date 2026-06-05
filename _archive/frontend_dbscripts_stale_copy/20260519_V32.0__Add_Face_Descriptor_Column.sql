-- Migration: Add face_descriptor column to store 128-D face embedding (face-api.js)
-- The descriptor is a JSON array of 128 floats, e.g. "[0.12, -0.34, ...]"
-- Comparison is done via Euclidean distance on the backend (threshold <= 0.6)

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[dbo].[ad_user_credential]')
    AND name = 'face_descriptor'
)
BEGIN
    ALTER TABLE [dbo].[ad_user_credential]
    ADD [face_descriptor] NVARCHAR(MAX) NULL;

    PRINT 'Column face_descriptor added to ad_user_credential.';
END
ELSE
BEGIN
    PRINT 'Column face_descriptor already exists. Skipped.';
END
