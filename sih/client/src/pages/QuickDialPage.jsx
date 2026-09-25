import React from 'react';
import './QuickDialPage.css';

/**
 * ============================================================================
 * QUICK DIAL CONTACTS CONFIGURATION
 * ============================================================================
 * Easily add, remove, or modify contacts below.
 * Each contact requires:
 *   - id: Unique identifier
 *   - name: Contact display name
 *   - phone: Contact phone number with country code (e.g. "+91 9602255365")
 * ============================================================================
 */
export const QUICK_DIAL_CONTACTS = [
  {
    id: '1',
    name: 'Nirvan',
    phone: '+91 9602255365',
  },
  {
    id: '2',
    name: 'Sahaj',
    phone: '+91 7646478084',
  },
  {
    id: '3',
    name: 'Ujjwal',
    phone: '+91 9782839025',
  },
  {
    id: '4',
    name: 'Paras',
    phone: '+91 8923864902',
  },
  {
    id: '5',
    name: 'Prakshal',
    phone: '+91 9638582018',
  },
  {
    id: '6',
    name: 'Manan',
    phone: '+91 8475902375',
  },
];

/**
 * Clean phone number into tel: URI format (e.g. tel:+919602255365)
 */
function formatTelUri(phone) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export default function QuickDialPage() {
  /**
   * Directly triggers dialing using native tel: URI
   */
  const handleDial = (phone, e) => {
    if (e) {
      e.stopPropagation();
    }
    const telUri = formatTelUri(phone);
    window.location.href = telUri;
  };

  return (
    <div className="qd-page-wrapper">
      <div className="qd-container">
        {/* Page Header */}
        <header className="qd-header">
          <h1 className="qd-title">
            <span className="qd-title-icon" role="img" aria-label="telephone">
              📞
            </span>
            Quick Dial
          </h1>
        </header>

        {/* Contacts Stack */}
        <div className="qd-contacts-list" role="list" aria-label="Emergency and Quick Dial Contacts">
          {QUICK_DIAL_CONTACTS.map((contact) => {
            const telHref = formatTelUri(contact.phone);

            return (
              <div
                key={contact.id}
                className="qd-card"
                role="button"
                tabIndex={0}
                onClick={(e) => handleDial(contact.phone, e)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDial(contact.phone, e);
                  }
                }}
                aria-label={`Call ${contact.name} at ${contact.phone}`}
                title={`Call ${contact.name} (${contact.phone})`}
              >
                {/* Contact Name & Phone Details */}
                <div className="qd-info">
                  <span className="qd-name">{contact.name}</span>
                  <span className="qd-phone">{contact.phone}</span>
                </div>

                {/* Dedicated Call Logo Button */}
                <a
                  href={telHref}
                  className="qd-call-btn"
                  onClick={(e) => handleDial(contact.phone, e)}
                  aria-label={`Dial ${contact.name} now`}
                  title={`Dial ${contact.name} (${contact.phone})`}
                >
                  <svg
                    className="qd-call-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {/* Phone Handset */}
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    {/* Sound Waves */}
                    <path d="M14.05 2a9 9 0 0 1 8 7.94" />
                    <path d="M14.05 6a5 5 0 0 1 4 4" />
                  </svg>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
