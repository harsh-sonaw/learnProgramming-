import React, { useState } from 'react';
import { 
  User, 
  Flame, 
  Trophy, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Terminal, 
  Layers, 
  Database, 
  Code2, 
  Cpu, 
  Edit3, 
  X,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BADGES } from '../data/badgesData';
import { COURSES } from '../data/courses';
import { LanguageId } from '../types';

export const ProfileView: React.FC = () => {
  const { user, updateUserProfile, triggerConfetti } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [avatarBg, setAvatarBg] = useState(user.avatarBg);

  const totalExercisesCount = Object.values(COURSES).reduce(
    (acc, c) => acc + c.modules.reduce((mAcc, m) => mAcc + m.exercises.length, 0),
    0
  );
  const totalSolvedCount = Object.keys(user.solvedExercises).length;

  const bgOptions = [
    'bg-emerald-600',
    'bg-blue-600',
    'bg-purple-600',
    'bg-amber-600',
    'bg-rose-600',
    'bg-cyan-600',
    'bg-indigo-600'
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      displayName: displayName.trim() || user.displayName,
      bio: bio.trim(),
      avatarBg
    });
    setIsEditing(false);
    triggerConfetti();
  };

  const getLangProgress = (langId: LanguageId) => {
    const course = COURSES[langId];
    if (!course) return { solved: 0, total: 0, percent: 0 };
    const all = course.modules.flatMap(m => m.exercises);
    const solved = all.filter(e => user.solvedExercises[e.id]).length;
    const percent = all.length > 0 ? Math.round((solved / all.length) * 100) : 0;
    return { solved, total: all.length, percent };
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className={`w-20 h-20 rounded-2xl ${user.avatarBg} flex items-center justify-center text-white text-3xl font-extrabold shadow-2xl ring-4 ring-slate-800/80 shrink-0`}>
            {user.displayName.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{user.displayName}</h1>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded font-bold">
                Lvl {user.level}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">@{user.username} · Joined {user.joinedDate}</p>
            <p className="text-xs text-slate-300 max-w-md pt-1">{user.bio}</p>
          </div>
        </div>

        <button
          onClick={() => {
            setDisplayName(user.displayName);
            setBio(user.bio);
            setAvatarBg(user.avatarBg);
            setIsEditing(true);
          }}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-center"
        >
          <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Primary Key Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono uppercase text-slate-400">Total Experience</span>
          <div className="text-2xl font-bold font-mono text-white flex items-center gap-1">
            <Zap className="w-5 h-5 text-amber-400" />
            {user.currentXp} <span className="text-xs text-slate-500 font-normal">XP</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono uppercase text-slate-400">Active Streak</span>
          <div className="text-2xl font-bold font-mono text-amber-400 flex items-center gap-1">
            <Flame className="w-5 h-5 fill-amber-400" />
            {user.streak} <span className="text-xs text-slate-500 font-normal">Days</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono uppercase text-slate-400">Problems Solved</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-5 h-5" />
            {totalSolvedCount} <span className="text-xs text-slate-500 font-normal">/ {totalExercisesCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono uppercase text-slate-400">League Tier</span>
          <div className="text-2xl font-bold font-mono text-yellow-400 flex items-center gap-1">
            <Trophy className="w-5 h-5" />
            {user.league}
          </div>
        </div>
      </div>

      {/* Language Mastery Radar / Progress Bars */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          Language Proficiency & Track Mastery
        </h3>

        <div className="space-y-3">
          {(['python', 'javascript', 'typescript', 'go', 'sql'] as LanguageId[]).map(langId => {
            const { solved, total, percent } = getLangProgress(langId);
            const name = COURSES[langId]?.name || langId;

            return (
              <div key={langId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 capitalize">{name}</span>
                  <span className="font-mono text-slate-400">{solved} / {total} solved ({percent}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges & Achievements Trophy Case */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Badges & Trophy Showcase ({user.unlockedBadgeIds.length} / {BADGES.length} Unlocked)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BADGES.map(badge => {
            const isUnlocked = user.unlockedBadgeIds.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
                  isUnlocked
                    ? 'bg-slate-900/90 border-slate-700/80 text-white'
                    : 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    isUnlocked
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800/60 text-slate-600 border border-slate-800'
                  }`}
                >
                  <Award className="w-6 h-6" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold truncate text-slate-200">{badge.title}</h4>
                    <span className="text-[10px] font-mono text-slate-400">{badge.rarity}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{badge.description}</p>
                  {isUnlocked && (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 pt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Unlocked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Edit Profile Details</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bio / Tagline</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Avatar Color</label>
                <div className="flex items-center gap-2">
                  {bgOptions.map(bg => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setAvatarBg(bg)}
                      className={`w-7 h-7 rounded-full ${bg} transition-transform ${
                        avatarBg === bg ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
