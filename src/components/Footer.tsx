import { birthdayConfig as cfg } from '../config';

export function Footer() {
  return (
    <footer className="footer">
      <p>{cfg.footerMessage}</p>
      <p className="footer-date">{cfg.footerDate}</p>
    </footer>
  );
}
