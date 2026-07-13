export const feedbackEmailTemplate = (feedbackData) => {
  const { message, email, type, username, timestamp } = feedbackData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Feedback Received</title>
        <style>
            body {
                font-family: "Poppins", sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background-color: #f5f5f5;
                border-radius: 8px;
                padding: 30px;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #6e9975;
                background-color: #0a3b2e;
                margin: -30px -30px 30px -30px;
                padding: 20px 30px;
                border-radius: 8px 8px 0 0;
            }
            .header h1 {
                color: #ffffff;
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }
            .feedback-section {
                margin-bottom: 25px;
            }
            .feedback-section h3 {
                color: #0a3b2e;
                margin-bottom: 10px;
                font-size: 16px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 600;
            }
            .feedback-content {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 6px;
                border-left: 4px solid #fdba17;
                font-size: 14px;
                line-height: 1.5;
            }
            .message-content {
                white-space: pre-wrap;
                word-wrap: break-word;
            }
            .metadata {
                margin-top: 20px;
            }
            .metadata-item {
                background-color: #f8f9fa;
                padding: 12px;
                border-radius: 6px;
                border: 1px solid #6e9975;
                margin-bottom: 15px;
            }
            .metadata-label {
                font-weight: 400;
                color: #0a3b2e;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
            }
            .metadata-value {
                color: #333;
                font-size: 14px;
                font-weight: 600;
            }
            .timestamp {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #6e9975;
                color: #6e9975;
                font-size: 12px;
                background-color: #6e9975;
                color: #ffffff;
                margin: 30px -30px -30px -30px;
                padding: 20px 30px;
                border-radius: 0 0 8px 8px;
            }
            .type-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .type-bug { background-color: #fdba17; color: #0a3b2e; }
            .type-feature { background-color: #6e9975; color: #ffffff; }
            .type-general { background-color: #0a3b2e; color: #ffffff; }
            .type-other { background-color: #fdba17; color: #0a3b2e; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📝 New Feedback Received</h1>
            </div>
        
            <div class="metadata">
                <div class="metadata-item">
                    <div class="metadata-label">Message</div>
                    <div class="metadata-value">${message || "No message provided"}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">From</div>
                    <div class="metadata-value">${username || "Anonymous"}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">Email</div>
                    <div class="metadata-value">${email || "Not provided"}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">Type</div>
                    <div class="metadata-value type-${type || "other"}">${type || "Other"}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">Submitted</div>
                    <div class="metadata-value">${timestamp || "Unknown"}</div>
                </div>
            </div>
            
            <div class="timestamp">
                This feedback was automatically sent from your Eventful app.
            </div>
        </div>
    </body>
    </html>
  `;
};
