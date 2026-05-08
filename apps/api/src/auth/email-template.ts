export function emailTemplate({
  heading,
  body,
  ctaUrl,
  ctaText,
}: {
  heading: string;
  body: string;
  ctaUrl: string;
  ctaText: string;
}) {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:32px 16px">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;padding:40px 32px;max-width:560px">
            <tr>
              <td>
                <p style="margin:0 0 32px;font-size:14px;font-weight:700;color:#b94a3b;letter-spacing:0.5px;text-transform:uppercase">Real Spanish Stories</p>
                <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#1a1a1a">${heading}</h1>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:#4a4a4a">${body}</p>
                <a href="${ctaUrl}" style="display:inline-block;background-color:#b94a3b;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:15px;font-weight:500">${ctaText}</a>
                <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#888888">If the button doesn't work, paste this link into your browser:<br><a href="${ctaUrl}" style="color:#888888;word-break:break-all">${ctaUrl}</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
