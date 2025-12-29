# Church Slide Generator - Content Directory

This directory contains all content and configuration for the Church Slide Generator feature.

## Directory Structure

```
slide_content/
├── incoming/           # Downloaded files from Google Drive (organized by service)
│   ├── 08AM/
│   ├── 11AM/
│   └── 06PM/
├── output_pptx/        # Generated PowerPoint files
├── services.json       # Service configuration (times & Drive folder IDs)
├── credentials.json    # Google Service Account credentials (NOT in git)
├── processed_files.json # Registry of already-downloaded files (auto-generated)
└── README.md          # This file
```

## Setup

### 1. Configure Google Drive Integration (Optional)

To enable automatic fetching from Google Drive:

1. **Create a Google Service Account:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google Drive API
   - Create a Service Account
   - Download the JSON credentials file

2. **Place Credentials:**
   - Save the credentials file as `credentials.json` in this directory
   - **DO NOT commit this file to git!** (It's already in .gitignore)

3. **Share Drive Folders:**
   - Copy the service account email from credentials.json
   - Share your Google Drive folders with this email address (view access)
   - Copy the folder IDs from the Drive URLs

4. **Update services.json:**
   - Edit `services.json` to add your Drive folder IDs
   ```json
   {
     "services": [
       {
         "name": "08AM",
         "start_time": "08:00",
         "drive_folder_id": "YOUR_FOLDER_ID_HERE"
       }
     ]
   }
   ```

### 2. Manual File Upload (Alternative)

If you don't want to use Google Drive, you can manually place files:

1. Create service directories:
   ```bash
   mkdir -p incoming/08AM/uncategorized
   mkdir -p incoming/11AM/uncategorized
   mkdir -p incoming/06PM/uncategorized
   ```

2. Copy your `.txt` or `.docx` files into the appropriate service's uncategorized folder

3. Use the "Generate Slides" button in the dashboard

## Slide Generation Rules

The system automatically formats slides based on content type:

- **Songs:** 6 lines per slide, 38pt font
- **Hymns:** 8 lines per slide, 34pt font
- **Announcements:** 10 lines per slide, 28pt font
- **Uncategorized:** 8 lines per slide, 32pt font

## Supported File Formats

- `.txt` - Plain text files
- `.docx` - Microsoft Word documents

## Usage

1. **Via Dashboard:**
   - Navigate to "Slide Generator" in the sidebar
   - Select your service (08AM, 11AM, or 06PM)
   - Click "Fetch from Drive" (if configured) or manually upload files
   - Click "Generate Slides"
   - Generated PowerPoint files will appear in the list

2. **Output Files:**
   - All generated files are saved to `output_pptx/`
   - Files are named: `{SERVICE}_{CATEGORY}_{FILENAME}.pptx`
   - Compatible with EasyWorship and other presentation software

## Troubleshooting

- **"credentials.json not found"**: Google Drive integration requires credentials (see setup above)
- **No files generated**: Ensure files exist in `incoming/{SERVICE}/uncategorized/`
- **Empty slides**: Check that your input files contain text content
- **Import errors**: Install required Python packages: `pip install -r requirements.txt`

## Notes

- The `processed_files.json` file tracks which Drive files have been downloaded to avoid duplicates
- Generated PowerPoint files use blank layouts with centered, bold text
- Text is automatically wrapped to fit within slides
- All files in uncategorized folders will be processed together
