interface YearViewProps {
  year: number;
  onBack: () => void;
  onSelectMonth: (month: number) => void;
}

const MONTHS = [
  { number: 1, name: "يناير", emoji: "❄️" },
  { number: 2, name: "فبراير", emoji: "🌸" },
  { number: 3, name: "مارس", emoji: "🌷" },
  { number: 4, name: "أبريل", emoji: "🌺" },
  { number: 5, name: "مايو", emoji: "🌻" },
  { number: 6, name: "يونيو", emoji: "☀️" },
  { number: 7, name: "يوليو", emoji: "🏖️" },
  { number: 8, name: "أغسطس", emoji: "🌞" },
  { number: 9, name: "سبتمبر", emoji: "🍂" },
  { number: 10, name: "أكتوبر", emoji: "🎃" },
  { number: 11, name: "نوفمبر", emoji: "🍁" },
  { number: 12, name: "ديسمبر", emoji: "🎄" },
];

export function YearView({ year, onBack, onSelectMonth }: YearViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md border border-orange-200 hover:border-orange-400 transition-colors"
        >
          <span>←</span>
          <span>العودة</span>
        </button>
        <h2 className="text-3xl font-bold text-gray-800">
          📅 أشهر عام {year}
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {MONTHS.map((month) => (
          <button
            key={month.number}
            onClick={() => onSelectMonth(month.number)}
            className="group relative bg-white rounded-xl p-6 shadow-lg border border-orange-200 hover:border-orange-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {month.emoji}
              </div>
              <div className="text-lg font-bold text-gray-800 mb-1">
                {month.name}
              </div>
              <div className="text-sm text-gray-500">
                الشهر {month.number}
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            📊 ملخص العام {year}
          </h3>
          <p className="text-gray-600">
            اختر الشهر لعرض التفاصيل اليومية والمبالغ المسجلة
          </p>
        </div>
      </div>
    </div>
  );
}
