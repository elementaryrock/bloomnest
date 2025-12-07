const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
  /**
   * Generate assessment report PDF
   */
  async generateAssessmentReport(assessment, patient, therapist) {
    return new Promise((resolve, reject) => {
      try {
        // Create PDF document
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        // Create reports directory if it doesn't exist
        const reportsDir = path.join(__dirname, '../reports');
        if (!fs.existsSync(reportsDir)) {
          fs.mkdirSync(reportsDir, { recursive: true });
        }

        // Generate filename
        const filename = `assessment_${assessment.assessmentId}_${Date.now()}.pdf`;
        const filepath = path.join(reportsDir, filename);

        // Pipe PDF to file
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Add header
        doc.fontSize(20)
          .font('Helvetica-Bold')
          .text('THERAPY ASSESSMENT REPORT', { align: 'center' })
          .moveDown();

        doc.fontSize(14)
          .font('Helvetica')
          .text('Marian Engineering College', { align: 'center' })
          .text('Therapy Unit', { align: 'center' })
          .moveDown(2);

        // Add patient information
        doc.fontSize(12)
          .font('Helvetica-Bold')
          .text('Patient Information', { underline: true })
          .moveDown(0.5);

        doc.font('Helvetica')
          .text(`Special ID: ${patient.specialId}`)
          .text(`Name: ${patient.childName}`)
          .text(`Date of Birth: ${new Date(patient.dateOfBirth).toLocaleDateString()}`)
          .text(`Age: ${patient.age} years`)
          .text(`Diagnosis: ${patient.diagnosis.join(', ')}`)
          .moveDown();

        // Add assessment information
        doc.font('Helvetica-Bold')
          .text('Assessment Information', { underline: true })
          .moveDown(0.5);

        doc.font('Helvetica')
          .text(`Assessment ID: ${assessment.assessmentId}`)
          .text(`Assessment Date: ${new Date(assessment.assessmentDate).toLocaleDateString()}`)
          .text(`Therapist: ${therapist.name}`)
          .text(`Specialization: ${therapist.specialization}`)
          .moveDown(2);

        // Add assessment sections
        const data = assessment.assessmentData;

        // Presenting Problems
        if (data.presentingProblems) {
          this.addSection(doc, 'Presenting Problems', data.presentingProblems);
        }

        // Developmental History
        if (data.developmentalHistory) {
          doc.addPage();
          doc.fontSize(12)
            .font('Helvetica-Bold')
            .text('Developmental History', { underline: true })
            .moveDown(0.5);

          if (data.developmentalHistory.prenatal) {
            this.addSubSection(doc, 'Prenatal', data.developmentalHistory.prenatal);
          }
          if (data.developmentalHistory.perinatal) {
            this.addSubSection(doc, 'Perinatal', data.developmentalHistory.perinatal);
          }
          if (data.developmentalHistory.postnatal) {
            this.addSubSection(doc, 'Postnatal', data.developmentalHistory.postnatal);
          }
          doc.moveDown();
        }

        // Motor Skills
        if (data.motorSkills) {
          this.addSection(doc, 'Motor Skills');
          if (data.motorSkills.grossMotor) {
            this.addSubSection(doc, 'Gross Motor', data.motorSkills.grossMotor);
          }
          if (data.motorSkills.fineMotor) {
            this.addSubSection(doc, 'Fine Motor', data.motorSkills.fineMotor);
          }
          doc.moveDown();
        }

        // Language Skills
        if (data.languageSkills) {
          this.addSection(doc, 'Language Skills');
          if (data.languageSkills.receptive) {
            this.addSubSection(doc, 'Receptive Language', data.languageSkills.receptive);
          }
          if (data.languageSkills.expressive) {
            this.addSubSection(doc, 'Expressive Language', data.languageSkills.expressive);
          }
          doc.moveDown();
        }

        // Social & Adaptive Skills
        if (data.socialAdaptiveSkills) {
          this.addSection(doc, 'Social & Adaptive Skills', data.socialAdaptiveSkills);
        }

        // Behavioral Observations
        if (data.behavioralObservations) {
          this.addSection(doc, 'Behavioral Observations', data.behavioralObservations);
        }

        // Test Administration & Scores
        if (data.testAdministration) {
          this.addSection(doc, 'Test Administration & Scores', data.testAdministration);
        }

        // Diagnosis & Impression
        if (data.diagnosisImpression) {
          doc.addPage();
          this.addSection(doc, 'Diagnosis & Impression', data.diagnosisImpression);
        }

        // Recommendations & Therapy Plan
        if (data.recommendations) {
          this.addSection(doc, 'Recommendations & Therapy Plan', data.recommendations);
        }

        // Follow-up Date
        if (data.followUpDate) {
          doc.moveDown()
            .font('Helvetica-Bold')
            .text(`Follow-up Date: ${new Date(data.followUpDate).toLocaleDateString()}`);
        }

        // Add footer
        doc.moveDown(2)
          .fontSize(10)
          .font('Helvetica')
          .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' })
          .text('This is a confidential document', { align: 'center' });

        // Finalize PDF
        doc.end();

        // Wait for stream to finish
        stream.on('finish', () => {
          resolve({
            filename,
            filepath,
            url: `/reports/${filename}` // This will be replaced with Cloudinary URL
          });
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add a section to the PDF
   */
  addSection(doc, title, content) {
    doc.fontSize(12)
      .font('Helvetica-Bold')
      .text(title, { underline: true })
      .moveDown(0.5);

    if (content) {
      doc.fontSize(11)
        .font('Helvetica')
        .text(content, { align: 'justify' })
        .moveDown();
    }
  }

  /**
   * Add a subsection to the PDF
   */
  addSubSection(doc, title, content) {
    doc.fontSize(11)
      .font('Helvetica-Bold')
      .text(title + ':', { continued: true })
      .font('Helvetica')
      .text(' ' + content, { align: 'justify' })
      .moveDown(0.5);
  }

  /**
   * Delete PDF file
   */
  async deletePDF(filepath) {
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Delete PDF error:', error);
      return false;
    }
  }
}

module.exports = new PDFService();
