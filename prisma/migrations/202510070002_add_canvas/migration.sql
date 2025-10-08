-- Add canvasJson column to store whiteboard data for each page content
ALTER TABLE "PageContent" ADD COLUMN "canvasJson" TEXT;
