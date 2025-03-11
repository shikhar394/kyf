import os
import asyncio
from typing import Optional
import base64
from pathlib import Path
from app.logger import logger
from app.tool.base import BaseTool

# TODO: Run output of PDF through GPT-4o to get a summary of the document compatible with founder research. 

class PDFParser(BaseTool):
    name: str = "pdf_parser"
    description: str = """Extract text content from a PDF file using OCR.
Use this tool when you need to process PDF documents and extract their textual content.
The tool reads a PDF file, performs OCR on it, and saves the extracted text to a file.
"""
    parameters: dict = {
        "type": "object",
        "properties": {
            "pdf_path": {
                "type": "string",
                "description": "(required) The file path to the PDF document to be processed.",
            },
            "output_path": {
                "type": "string",
                "description": "(optional) The file path where the extracted text will be saved. If not provided, a default path will be used.",
            },
        },
        "required": ["pdf_path"],
    }

    async def execute(self, pdf_path: str, output_path: Optional[str] = None) -> str:
        """
        Extract text from a PDF file using OCR and save it to a text file.

        Args:
            pdf_path (str): Path to the PDF file to be processed.
            output_path (Optional[str]): Path where the extracted text will be saved.
                If not provided, it will be saved to the same location as the PDF with a .txt extension.

        Returns:
            str: Path to the output text file containing the extracted content.
        """
        # Validate PDF path
        pdf_path = "/Users/shikharsakhuja/Desktop/projects/OpenManus/sample_pitch_deck.pdf"
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found at path: {pdf_path}")
        
        # Set default output path if not provided
        if output_path is None:
            pdf_path_obj = Path(pdf_path)
            output_path = str(pdf_path_obj.with_suffix('.txt'))
        
        # Read the PDF file as binary data
        # with open(pdf_path, "rb") as f:
        #     pdf_data = f.read()
        
        # # Encode the PDF data as base64
        # pdf_base64 = base64.b64encode(pdf_data).decode('utf-8')
        
        # Extract text using Claude (placeholder for actual implementation)
        extracted_text = await self._extract_text_with_claude(pdf_path)
        
        # Save the extracted text to the output file
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(extracted_text)
        
        return output_path
    
    async def _extract_text_with_claude(self, pdf_path: str) -> str:
        """
        Use Claude to extract text from a PDF.
        
        Args:
            pdf_path (str): Path to the PDF file to be processed.
            
        Returns:
            str: Extracted text from the PDF.
        """
        from mistralai import DocumentURLChunk, ImageURLChunk, TextChunk, Mistral
        import json

        api_key = "p2YavhV4Z6WXJUflqGj7onzTtfGRx1hP"
        client = Mistral(api_key=api_key)

        uploaded_pdf = client.files.upload(
            file={
                "file_name": pdf_path,
                "content": open(pdf_path, "rb"),
            },
            purpose="ocr"
        )  

        signed_url = client.files.get_signed_url(file_id=uploaded_pdf.id)

        ocr_response = client.ocr.process(
            model="mistral-ocr-latest",
            document={
                "type": "document_url",
                "document_url": signed_url.url,
            }
        )

        pdf_response = client.ocr.process(document=DocumentURLChunk(document_url=signed_url.url), model="mistral-ocr-latest", include_image_base64=True)

        response_dict = json.loads(pdf_response.json())
        json_string = json.dumps(response_dict, indent=4)
        content = [item['markdown'] for item in json.loads(json_string)['pages']]

        logger.info(content)

        return "\n".join(content)
