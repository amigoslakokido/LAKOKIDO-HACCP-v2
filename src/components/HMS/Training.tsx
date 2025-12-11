import { useState, useEffect } from 'react';
import { hmsApi, HMSTrainingSession } from '../../lib/hmsSupabase';
import { GraduationCap, Plus, Users, Calendar, Clock, Award } from 'lucide-react';

export function Training() {
  const [sessions, setSessions] = useState<HMSTrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    session_date: new Date().toISOString().split('T')[0],
    session_time: '10:00',
    duration_minutes: 60,
    trainer: '',
    location: '',
    attendees: [] as string[],
  });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    const { data } = await hmsApi.getTrainingSessions();
    if (data) setSessions(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await hmsApi.createTrainingSession({
      ...formData,
      attendance_count: formData.attendees.length,
      certificate_issued: false,
    });

    if (!error) {
      await loadSessions();
      setShowForm(false);
      resetForm();
    }

    setSaving(false);
  };

  const resetForm = () => {
    setFormData({
      topic: '',
      description: '',
      session_date: new Date().toISOString().split('T')[0],
      session_time: '10:00',
      duration_minutes: 60,
      trainer: '',
      location: '',
      attendees: [],
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Laster opplæring...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sikkerhetstrening</h2>
          <p className="text-slate-600">Safety Training</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold"
        >
          <Plus className="w-5 h-5" />
          Ny økt
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 border-2 border-blue-200">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Registrer treningsøkt</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Emne</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="F.eks: Brannsikkerhet, Førstehjelp..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Instruktør</label>
                <input
                  type="text"
                  value={formData.trainer}
                  onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Dato</label>
                <input
                  type="date"
                  value={formData.session_date}
                  onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tid</label>
                <input
                  type="time"
                  value={formData.session_time}
                  onChange={(e) => setFormData({ ...formData, session_time: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Varighet (minutter)</label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                  min="15"
                  step="15"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Sted</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Møterom, Kjøkken..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Beskrivelse</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold disabled:opacity-50"
              >
                {saving ? 'Lagrer...' : 'Lagre økt'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-4 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all font-bold"
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
          <GraduationCap className="w-12 h-12 text-blue-600 mb-4" />
          <div className="text-3xl font-black text-blue-900 mb-2">{sessions.length}</div>
          <p className="text-blue-700 font-bold">Totale økter</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border-2 border-emerald-200">
          <Users className="w-12 h-12 text-emerald-600 mb-4" />
          <div className="text-3xl font-black text-emerald-900 mb-2">
            {sessions.reduce((sum, s) => sum + s.attendance_count, 0)}
          </div>
          <p className="text-emerald-700 font-bold">Deltakere</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200">
          <Award className="w-12 h-12 text-purple-600 mb-4" />
          <div className="text-3xl font-black text-purple-900 mb-2">
            {sessions.filter(s => s.certificate_issued).length}
          </div>
          <p className="text-purple-700 font-bold">Sertifikater</p>
        </div>
      </div>

      <div className="grid gap-4">
        {sessions.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl">
            <GraduationCap className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Ingen treningsøkter registrert</p>
            <p className="text-slate-500">No training sessions registered</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-blue-300 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{session.topic}</h3>
                  <p className="text-sm text-slate-600 mt-1">{session.description}</p>
                </div>
                {session.certificate_issued && (
                  <Award className="w-6 h-6 text-amber-500" />
                )}
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{session.session_date}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{session.session_time} ({session.duration_minutes} min)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{session.attendance_count} deltakere</span>
                </div>
                <div className="text-sm font-bold text-blue-600">
                  {session.trainer}
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-600 mb-1">Sted</p>
                <p className="text-sm font-bold text-slate-900">{session.location}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
