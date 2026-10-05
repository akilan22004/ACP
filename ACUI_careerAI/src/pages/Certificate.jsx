import React, { useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCareer } from '../context/CareerContext';
import { Award, ArrowRight, Download, Printer, Lock } from 'lucide-react';
import jsPDF from 'jspdf';

export default function Certificate() {
  const { currentUser } = useAuth();
  const { 
    selectedCareer, 
    certificateUnlocked, 
    certificateData, 
    generateCertificate,
    overallScore,
    readinessLevel,
    strongestSkill
  } = useCareer();
  
  const certRef = useRef(null);

  useEffect(() => {
    if (certificateUnlocked && !certificateData && currentUser) {
      generateCertificate(currentUser);
    }
  }, [certificateUnlocked, certificateData, currentUser, generateCertificate]);

  if (!selectedCareer) return <Navigate to="/careers" replace />;

  if (!certificateUnlocked) {
    return (
      <section className="certificate-page certificate-page-state certificate-page-locked mx-auto max-w-6xl" aria-labelledby="certificate-page-title">
        <header className="certificate-state-heading">
          <p className="certificate-state-eyebrow">Digital Skill Passport</p>
          <h1 id="certificate-page-title">Your <span>Achievements</span></h1>
          <p>Your career milestone will appear here once its requirements are complete.</p>
        </header>
        <div className="certificate-locked-panel">
          <div className="certificate-lock-icon" aria-hidden="true"><Lock size={26} /></div>
          <div className="certificate-locked-copy">
            <p className="certificate-state-eyebrow">Next step</p>
            <h2>Certificate locked</h2>
            <p>Pass all three assessment stages and the AI mock interview. The passport is issued only after those prerequisites.</p>
            <Link to="/assessment" className="certificate-next-step">Go to assessment hub <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    );
  }

  if (!certificateData) {
    return (
      <section className="certificate-page certificate-page-state certificate-page-loading mx-auto max-w-6xl" aria-labelledby="certificate-page-title">
        <header className="certificate-state-heading">
          <p className="certificate-state-eyebrow">Digital Skill Passport</p>
          <h1 id="certificate-page-title">Your <span>Achievements</span></h1>
          <p>Your career milestone will appear here once its requirements are complete.</p>
        </header>
        <div className="certificate-loading" role="status" aria-live="polite">
          <span className="learning-loading-mark" aria-hidden="true" />
          <span>Preparing your Digital Skill Passport…</span>
        </div>
      </section>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [860, 640]
    });

    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 860, 640, 'F');

    doc.setDrawColor(15, 118, 110);
    doc.setLineWidth(2);
    doc.rect(28, 28, 804, 584);

    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(1);
    doc.rect(42, 42, 776, 556);

    doc.setTextColor(15, 118, 110);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CAREERAI', 430, 88, { align: 'center' });

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(30);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATE OF COMPLETION', 430, 135, { align: 'center' });

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('This is to certify that', 430, 185, { align: 'center' });

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(30);
    doc.setFont('helvetica', 'bold');
    doc.text(certificateData.name, 430, 240, { align: 'center' });

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('has successfully completed', 430, 285, { align: 'center' });

    doc.setTextColor(13, 148, 136);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(selectedCareer?.title || certificateData.career || 'CareerAI Learning Path', 430, 330, { align: 'center' });

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Assessment Score: ${certificateData.overallScore ?? overallScore}%`, 105, 400);
    doc.text(`Interview: ${certificateData.interviewScore ?? 'Not recorded'}${certificateData.interviewScore != null ? '%' : ''}`, 330, 400);
    doc.text(`Readiness: ${certificateData.readinessLevel || readinessLevel}`, 560, 400);
    doc.text(`Issue Date: ${certificateData.date}`, 105, 440);
    doc.text(`Certificate ID: ${certificateData.id}`, 560, 440, { align: 'right' });

    doc.setDrawColor(15, 118, 110);
    doc.setLineWidth(1.5);
    doc.line(120, 490, 290, 490);
    doc.line(570, 490, 740, 490);

    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text('Authorized Signature', 120, 510);
    doc.text('CareerAI', 610, 510);

    doc.save(`${certificateData.name.replace(/\s+/g, '_')}_CareerAI_Certificate.pdf`);
  };

  return (
    <div className="certificate-page certificate-page-ready mx-auto max-w-6xl space-y-6 pb-10">
      <header className="certificate-heading no-print">
        <div className="certificate-hero-heading">
          <p className="certificate-hero-eyebrow">Digital Skill Passport</p>
          <h1>Your <span>Achievements</span></h1>
        </div>
        <div className="certificate-hero-art-wrap">
          <img className="certificate-achievement-art" src="/images/scenes/certificate-achievement-avatar.png" alt="" aria-hidden="true" loading="lazy" />
        </div>
        <div className="certificate-hero-copy">
          <p className="certificate-hero-description">Celebrate your completed assessment and interview with your CareerAI passport.</p>
          <div className="certificate-actions">
            <button type="button" onClick={handlePrint} className="certificate-secondary-action"><Printer size={16} aria-hidden="true" /> Print</button>
            <button type="button" onClick={handleDownload} className="certificate-primary-action"><Download size={16} aria-hidden="true" /> Download PDF</button>
          </div>
        </div>
      </header>

      <div className="certificate-display">
        <div ref={certRef} className="certificate-print-container certificate-modern">
          <div className="certificate-inner-border" aria-hidden="true" />
          <div className="certificate-topline">
            <img className="certificate-brand-logo" src="/images/careerai-logo.png" alt="CareerAI" />
            <span>{certificateData.id}</span>
          </div>

          <div className="certificate-main-content">
            <div className="certificate-award-mark"><Award size={28} /></div>
            <p className="certificate-eyebrow">Certificate of Completion</p>
            <p className="certificate-copy">This is to certify that</p>
            <h2 className="certificate-candidate">{certificateData.name}</h2>
            <p className="certificate-copy">has successfully completed</p>
            <h3 className="certificate-career">{selectedCareer?.title || certificateData.career || 'CareerAI learning pathway'}</h3>

            <div className="certificate-metrics">
              <div><span>Assessment score</span><strong>{certificateData.overallScore ?? overallScore}%</strong></div>
              <div><span>Interview</span><strong>{certificateData.interviewScore ?? 'Not recorded'}{certificateData.interviewScore != null ? '%' : ''}</strong></div>
              <div><span>Readiness</span><strong>{certificateData.readinessLevel || readinessLevel}</strong></div>
              {(certificateData.strongestSkill || strongestSkill) && <div><span>Strongest skill</span><strong>{certificateData.strongestSkill || strongestSkill}</strong></div>}
            </div>
          </div>

          <footer className="certificate-footer">
            <div>
              <span>Issued</span>
              <strong>{certificateData.date}</strong>
            </div>
            <div className="certificate-signature-block">
              <span>Authorized by</span>
              <img className="certificate-brand-logo" src="/images/careerai-logo.png" alt="CareerAI" />
            </div>
            <div>
              <span>Certificate ID</span>
              <strong>{certificateData.id}</strong>
            </div>
          </footer>
        </div>
      </div>

      <p className="certificate-disclaimer no-print">Your Digital Skill Passport reflects the results and issue details recorded above.</p>
    </div>
  );
}
