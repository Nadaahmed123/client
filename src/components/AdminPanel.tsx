import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function AdminPanel() {
  const users = useQuery(api.admin.getAllUsers);
  const updateDeductions = useMutation(api.admin.updateUserDeductions);
  const updateUsername = useMutation(api.admin.updateUsername);
  const deleteUser = useMutation(api.admin.deleteUser);
  const completeSystemReset = useMutation(api.admin.completeSystemReset);
  const resetDataOnly = useMutation(api.admin.resetDataOnly);

  const [editingUser, setEditingUser] = useState<Id<"users"> | null>(null);
  const [editingDeductions, setEditingDeductions] = useState<Id<"users"> | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [newDeductions, setNewDeductions] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // حالات التصفير
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetType, setResetType] = useState<'complete' | 'data'>('data');
  const [confirmationText, setConfirmationText] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleUpdateUsername = async (userId: Id<"users">) => {
    if (!newUsername.trim()) {
      toast.error("يرجى إدخال اسم المستخدم الجديد");
      return;
    }

    setLoading(true);
    try {
      await updateUsername({ userId, newUsername: newUsername.trim() });
      toast.success("تم تحديث اسم المستخدم بنجاح");
      setEditingUser(null);
      setNewUsername("");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحديث اسم المستخدم");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDeductions = async (userId: Id<"users">) => {
    if (newDeductions < 0) {
      toast.error("لا يمكن أن تكون الخصميات أقل من الصفر");
      return;
    }

    setLoading(true);
    try {
      await updateDeductions({ userId, deductions: newDeductions });
      toast.success("تم تحديث الخصميات بنجاح");
      setEditingDeductions(null);
      setNewDeductions(0);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحديث الخصميات");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: Id<"users">, username: string) => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${username}"؟ سيتم حذف جميع بياناته نهائياً.`)) {
      return;
    }

    setLoading(true);
    try {
      await deleteUser({ userId });
      toast.success("تم حذف المستخدم بنجاح");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء حذف المستخدم");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    const expectedText = resetType === 'complete' ? 'تصفير كامل' : 'تصفير البيانات';
    
    if (confirmationText !== expectedText) {
      toast.error(`يرجى كتابة "${expectedText}" بالضبط للتأكيد`);
      return;
    }

    setResetLoading(true);
    try {
      if (resetType === 'complete') {
        const result = await completeSystemReset({ confirmationText });
        toast.success(result.message);
      } else {
        const result = await resetDataOnly({ confirmationText });
        toast.success(result.message);
      }
      setShowResetModal(false);
      setConfirmationText("");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء التصفير");
    } finally {
      setResetLoading(false);
    }
  };

  if (users === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">
          👑 إدارة المستخدمين
        </h2>
        
        {/* أزرار التصفير */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setResetType('data');
              setShowResetModal(true);
            }}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
          >
            🗑️ تصفير البيانات
          </button>
          <button
            onClick={() => {
              setResetType('complete');
              setShowResetModal(true);
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            ⚠️ تصفير كامل
          </button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-lg border border-orange-200 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {users?.length || 0}
          </div>
          <div className="text-sm text-gray-600">إجمالي المستخدمين</div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg border border-orange-200 text-center">
          <div className="text-2xl font-bold text-green-600">
            {users?.filter(u => u.isAdmin).length || 0}
          </div>
          <div className="text-sm text-gray-600">المديرين</div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg border border-orange-200 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {users?.filter(u => !u.isAdmin).length || 0}
          </div>
          <div className="text-sm text-gray-600">المستخدمين العاديين</div>
        </div>
      </div>

      {/* قائمة المستخدمين */}
      <div className="bg-white rounded-xl shadow-lg border border-orange-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500">
          <h3 className="text-xl font-semibold text-white">قائمة المستخدمين</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المستخدم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الخصميات</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الإنشاء</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users?.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {user.isAdmin ? "👑" : "👤"}
                      </span>
                      <div>
                        {editingUser === user.userId ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newUsername}
                              onChange={(e) => setNewUsername(e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="اسم المستخدم الجديد"
                            />
                            <button
                              onClick={() => handleUpdateUsername(user.userId)}
                              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                              disabled={loading}
                            >
                              ✅
                            </button>
                            <button
                              onClick={() => {
                                setEditingUser(null);
                                setNewUsername("");
                              }}
                              className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                            >
                              ❌
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.user?.email || "لا يوجد إيميل"}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isAdmin 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.isAdmin ? "مدير" : "مستخدم"}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    {editingDeductions === user.userId ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={newDeductions}
                          onChange={(e) => setNewDeductions(Number(e.target.value))}
                          className="px-2 py-1 border border-gray-300 rounded text-sm w-20"
                          min="0"
                          step="0.01"
                        />
                        <button
                          onClick={() => handleUpdateDeductions(user.userId)}
                          className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                          disabled={loading}
                        >
                          ✅
                        </button>
                        <button
                          onClick={() => {
                            setEditingDeductions(null);
                            setNewDeductions(0);
                          }}
                          className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                        >
                          ❌
                        </button>
                      </div>
                    ) : (
                      <span className="text-red-600 font-medium">
                        {user.deductions?.toLocaleString() || 0} ر.س
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {editingUser !== user.userId && (
                        <button
                          onClick={() => {
                            setEditingUser(user.userId);
                            setNewUsername(user.username);
                          }}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                          disabled={loading}
                        >
                          ✏️ تعديل الاسم
                        </button>
                      )}
                      
                      {editingDeductions !== user.userId && (
                        <button
                          onClick={() => {
                            setEditingDeductions(user.userId);
                            setNewDeductions(user.deductions || 0);
                          }}
                          className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
                          disabled={loading}
                        >
                          💰 تعديل الخصميات
                        </button>
                      )}
                      
                      {!user.isAdmin && (
                        <button
                          onClick={() => handleDeleteUser(user.userId, user.username)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                          disabled={loading}
                        >
                          🗑️ حذف
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* نافذة التصفير */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">
                {resetType === 'complete' ? '⚠️' : '🗑️'}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {resetType === 'complete' ? 'تصفير كامل للنظام' : 'تصفير البيانات فقط'}
              </h3>
              <p className="text-gray-600 text-sm">
                {resetType === 'complete' 
                  ? 'سيتم حذف جميع البيانات والمستخدمين عدا حسابك كمدير. هذا الإجراء لا يمكن التراجع عنه!'
                  : 'سيتم حذف جميع البيانات المالية مع الاحتفاظ بجميع المستخدمين. هذا الإجراء لا يمكن التراجع عنه!'
                }
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  للتأكيد، اكتب "{resetType === 'complete' ? 'تصفير كامل' : 'تصفير البيانات'}" بالضبط:
                </label>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={resetType === 'complete' ? 'تصفير كامل' : 'تصفير البيانات'}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  disabled={resetLoading || confirmationText !== (resetType === 'complete' ? 'تصفير كامل' : 'تصفير البيانات')}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resetLoading ? 'جاري التصفير...' : (resetType === 'complete' ? '⚠️ تصفير كامل' : '🗑️ تصفير البيانات')}
                </button>
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    setConfirmationText("");
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={resetLoading}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* معلومات إضافية */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
        <h4 className="font-semibold text-gray-800 mb-3">💡 معلومات مهمة</h4>
        <div className="text-sm text-gray-600 space-y-2">
          <div>• <strong>تصفير البيانات:</strong> يحذف جميع البيانات المالية ويحتفظ بالمستخدمين</div>
          <div>• <strong>تصفير كامل:</strong> يحذف جميع البيانات والمستخدمين عدا حسابك كمدير</div>
          <div>• لا يمكن حذف حساب المدير من قبل مدير آخر</div>
          <div>• عند حذف مستخدم، يتم حذف جميع بياناته نهائياً</div>
          <div>• الخصميات الثابتة تظهر في حسابات المستخدمين</div>
        </div>
      </div>
    </div>
  );
}
