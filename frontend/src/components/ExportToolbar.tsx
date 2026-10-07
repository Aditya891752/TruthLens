import { VerificationReport } from '../types/report';

interface ExportToolbarProps {
  report: VerificationReport;
  onShowToast: (msg: string) => void;
}

export default function ExportToolbar({ report, onShowToast }: ExportToolbarProps) {
  const handleCopyMarkdown = () => {
    const lines = [
      `# TruthLens Forensic Factuality Audit Report`,
      `**Report ID**: \`${report.id}\` | **Analyzed At**: ${report.analyzed_at}`,
      `**Truth Index**: ${report.metrics.truth_score}% | **Hallucination Risk**: ${report.metrics.hallucination_risk}`,
      `**Total Claims**: ${report.metrics.total_claims} (Supported: ${report.metrics.supported_count}, Contradicted: ${report.metrics.contradicted_count}, Unverified: ${report.metrics.unverified_count})`,
      '',
      `## Original Text`,
      `> ${report.original_text}`,
      '',
      `## Extracted Claims & Verification Verdicts`,
    ];

    report.claims.forEach((c) => {
      lines.push(
        `### [${c.verdict}] #${c.id.toUpperCase()}: "${c.text}"`,
        `- **Confidence**: ${Math.round(c.confidence * 100)}%`,
        `- **Forensic Evidence**: ${c.reasoning}`
      );
      if (c.sources && c.sources.length > 0) {
        lines.push(`- **Web Citations**:`);
        c.sources.forEach((s) => {
          lines.push(`  - [${s.title}](${s.url}) (${s.domain})`);
        });
      }
      lines.push('');
    });

    navigator.clipboard.writeText(lines.join('\n'));
    onShowToast('Audit summary copied to clipboard as Markdown');
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `truthlens-audit-${report.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast('Full JSON report downloaded');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 'var(--space-3)',
      marginTop: 'var(--space-6)',
      paddingTop: 'var(--space-4)',
      borderTop: '1px solid var(--border-default)'
    }}>
      <button
        type="button"
        className="btn-secondary"
        onClick={handleCopyMarkdown}
      >
        Copy Markdown Summary
      </button>
      <button
        type="button"
        className="btn-secondary"
        onClick={handleDownloadJSON}
      >
        Download JSON Audit
      </button>
    </div>
  );
}
