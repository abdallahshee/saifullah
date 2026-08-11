export function SchoolMap() {
  return (
    <div className="h-80 w-full overflow-hidden rounded-2xl lg:h-full lg:min-h-[360px]">
      <iframe
        src="https://www.google.com/maps?q=-4.0856279,39.6458361&z=15&output=embed"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Saifullah Integrated Academy location"
      />
    </div>
  );
}