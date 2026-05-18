package com.nutech.email.service;

import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.Tesseract;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class OcrService {

    @Value("${ocr.tessdata-path:/usr/share/tesseract-ocr/5/tessdata}")
    private String tessdataPath;

    @Value("${ocr.language:eng}")
    private String language;

    /**
     * Extract text from a PDF. Tries text extraction first, falls back to OCR for image-only PDFs.
     */
    @Async("taskExecutor")
    public CompletableFuture<String> extractTextFromPdf(byte[] pdfBytes) {
        long start = System.currentTimeMillis();
        try {
            PDDocument document = Loader.loadPDF(pdfBytes);
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);

            // If text extraction yields very little, the PDF is likely image-based
            if (text.trim().length() < 50) {
                log.info("PDF appears image-based, falling back to OCR");
                text = ocrPdfPages(document);
            }

            document.close();
            log.debug("PDF text extraction completed in {}ms, {} chars", 
                      System.currentTimeMillis() - start, text.length());
            return CompletableFuture.completedFuture(text);
        } catch (Exception e) {
            log.error("PDF text extraction failed: {}", e.getMessage(), e);
            return CompletableFuture.completedFuture("");
        }
    }

    /**
     * Extract text from an image (JPG/PNG) using Tesseract OCR.
     */
    @Async("taskExecutor")
    public CompletableFuture<String> extractTextFromImage(byte[] imageBytes) {
        long start = System.currentTimeMillis();
        try {
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageBytes));
            if (image == null) {
                log.warn("Could not read image bytes");
                return CompletableFuture.completedFuture("");
            }

            Tesseract tesseract = createTesseract();
            String text = tesseract.doOCR(image);

            log.debug("Image OCR completed in {}ms, {} chars",
                      System.currentTimeMillis() - start, text.length());
            return CompletableFuture.completedFuture(text);
        } catch (Exception e) {
            log.error("Image OCR failed: {}", e.getMessage(), e);
            return CompletableFuture.completedFuture("");
        }
    }

    private String ocrPdfPages(PDDocument document) throws Exception {
        PDFRenderer renderer = new PDFRenderer(document);
        Tesseract tesseract = createTesseract();
        StringBuilder fullText = new StringBuilder();

        for (int page = 0; page < document.getNumberOfPages(); page++) {
            BufferedImage image = renderer.renderImageWithDPI(page, 300);
            String pageText = tesseract.doOCR(image);
            fullText.append(pageText).append("\n");
        }

        return fullText.toString();
    }

    private Tesseract createTesseract() {
        Tesseract tesseract = new Tesseract();
        tesseract.setDatapath(tessdataPath);
        tesseract.setLanguage(language);
        tesseract.setPageSegMode(1); // Automatic page segmentation with OSD
        return tesseract;
    }
}
