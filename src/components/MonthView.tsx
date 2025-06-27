import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface MonthViewProps {
  year: number;
  month: number;
  onBack: () => void;
  onSelectDate: (date: string) => void;
  userId: Id<"users">;
  isAdmin: boolean;
}

const MONTH_NAMES = [
  "", "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const WEEKDAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export function MonthView({ year, month, onBack, onSelectDate, userId, isAdmin }: MonthViewProps) {
  const entries = useQuery(api.dailyEntries.getDailyEntries, { 
    year, 
    month,
    targetUserId: userId 
  });
  
  const monthlyAdvances = useQuery(api.dailyEntries.getMonthlyAdvances, {
    yearMonth: `${year}-${month.toString().padStart(2, '0')}`,
    targetUserId: userId
  });

  const userProfile = useQuery(api.userProfiles.getUserProfile, { targetUserId: userId });

  // إنشاء تقويم الشهر
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const calendarDays = [];
  
  // إضافة الأيام الفارغة في بداية الشهر
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // إضافة أيام الشهر
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // البحث عن مدخل لتاريخ معين
  const getEntryForDate = (day: number) => {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return entries?.find(entry => entry.date === dateStr);
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    onSelectDate(dateStr);
  };

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
          📅 {MONTH_NAMES[month]} {year}
        </h2>
      </div>

      {/* معلومات الشهر */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200">
        {isAdmin ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {entries?.length || 0}
            </div>
            <div className="text-sm text-gray-600">أيام مسجلة</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {entries?.reduce((sum, entry) => sum + ((entry.cashAmount || 0) + (entry.networkAmount || 0)), 0).toLocaleString()} ر.س
            </div>
            <div className="text-sm text-gray-600">إجمالي المبالغ</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {monthlyAdvances?.toLocaleString() || 0} ر.س
            </div>
            <div className="text-sm text-gray-600">السلفيات التراكمية</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {userProfile?.deductions?.toLocaleString() || 0} ر.س
            </div>
            <div className="text-sm text-gray-600">الخصومات الثابتة</div>
          </div>
        </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {entries?.length || 0}
              </div>
              <div className="text-sm text-gray-600">أيام مسجلة</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {monthlyAdvances?.toLocaleString() || 0} ر.س
              </div>
              <div className="text-sm text-gray-600">السلفيات التراكمية</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {userProfile?.deductions?.toLocaleString() || 0} ر.س
              </div>
              <div className="text-sm text-gray-600">الخصومات الثابتة</div>
            </div>
          </div>
        )}
      </div>

      {/* التقويم */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200">
        {/* أيام الأسبوع */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* أيام الشهر */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={index} className="h-16"></div>;
            }

            const entry = getEntryForDate(day);
            const hasData = !!entry;
            const isToday = new Date().toDateString() === new Date(year, month - 1, day).toDateString();

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`
                  relative h-16 rounded-lg border-2 transition-all duration-200 transform hover:scale-105
                  ${hasData 
                    ? 'bg-green-50 border-green-300 hover:border-green-400 shadow-md' 
                    : 'bg-gray-50 border-gray-200 hover:border-orange-300'
                  }
                  ${isToday ? 'ring-2 ring-orange-400' : ''}
                `}
              >
                <div className="text-lg font-semibold text-gray-800">
                  {day}
                </div>
                {hasData && isAdmin && (
                  <div className="absolute bottom-1 left-1 right-1">
                    <div className="text-xs text-green-600 font-medium">
                      {entry.total?.toLocaleString()} ر.س
                    </div>
                  </div>
                )}
                {hasData && !isAdmin && (
                  <div className="absolute bottom-1 left-1 right-1">
                    <div className="text-xs text-green-600 font-medium">
                      ✅ مكتمل
                    </div>
                  </div>
                )}
                {isToday && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-orange-400 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* إرشادات */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="text-orange-500">💡</span>
          <span>اضغط على أي يوم لإضافة أو عرض البيانات المالية</span>
        </div>
      </div>
    </div>
  );
}
