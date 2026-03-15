import React from 'react';
import { ArrowLeft, ExternalLink, GitCommit, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const releases = [
    {
        version: '0.9.0',
        date: '2026-03-15',
        title: 'Booking reliability and media handling',
        summary: 'Booking data now reflects correctly in the app, and newer image uploads are routed through Cloudinary while older base64 records remain supported.',
        commits: [
            { hash: 'd0f5845', label: 'Booking reflected properly and fetched' },
            { hash: '935fc5e', label: 'New image uploads to Cloudinary, old stays as base64 in Mongo' },
        ],
        changes: [
            'Fixed booking fetch/display behavior so appointments stay in sync with stored data.',
            'Improved patient image storage by supporting Cloudinary uploads without breaking older records.',
        ],
    },
    {
        version: '0.8.0',
        date: '2026-03-04',
        title: 'Therapist workflow expansion',
        summary: 'Therapists gained stronger day-to-day tooling for assessments and SkillSprout analysis.',
        commits: [
            { hash: 'aee96e1', label: 'Therapist assessment management listing, searching, and creating' },
            { hash: '45789ec', label: 'Therapist SkillSprout page for search and analytics' },
        ],
        changes: [
            'Added therapist assessment listing, search, and creation flows.',
            'Expanded therapist-side SkillSprout with search and analytics views.',
        ],
    },
    {
        version: '0.7.0',
        date: '2026-03-03',
        title: 'Search and parent dashboard improvements',
        summary: 'Core parent-facing flows were refined with better discoverability and interaction updates.',
        commits: [
            { hash: 'dbdb5f2', label: 'Modified search features' },
            { hash: '070fbf6', label: 'Updated functionality of few parent dashboard buttons' },
        ],
        changes: [
            'Improved search behavior across dashboard flows.',
            'Refined several parent dashboard actions for smoother navigation and use.',
        ],
    },
    {
        version: '0.6.0',
        date: '2026-03-03',
        title: 'Visual refresh across login and dashboards',
        summary: 'The app received a broader UI refresh with updated branding, cleaner login visuals, and a more polished overall dashboard presentation.',
        commits: [
            { hash: 'c48526c', label: 'Updated login page design' },
            { hash: '58a8f06', label: 'Added new logos and changed dashboard design' },
            { hash: '47c1392', label: 'Changed overall design' },
        ],
        changes: [
            'Redesigned the login experience.',
            'Updated dashboard branding and logos.',
            'Applied a broader visual cleanup across the product.',
        ],
    },
    {
        version: '0.5.0',
        date: '2026-02-24',
        title: 'SkillSprout progress tracking',
        summary: 'SkillSprout matured into a connected parent and therapist workflow for goals and progress visibility.',
        commits: [
            { hash: '86c1312', label: 'SkillSprout for therapist goal management and parent progress tracking' },
        ],
        changes: [
            'Added therapist goal-management support in SkillSprout.',
            'Added parent-facing progress tracking for SkillSprout activity.',
        ],
    },
    {
        version: '0.4.0',
        date: '2026-02-24',
        title: 'TherapyRipple introduced',
        summary: 'A dedicated TherapyRipple feature was added to the parent experience.',
        commits: [
            { hash: '86c06e4', label: 'Add TherapyRipple' },
        ],
        changes: [
            'Introduced the TherapyRipple page and feature flow.',
        ],
    },
    {
        version: '0.3.0',
        date: '2026-02-24',
        title: 'Initial SkillSprout release',
        summary: 'The first parent-facing SkillSprout experience landed in the app.',
        commits: [
            { hash: '9d4d98e', label: 'Implement SkillSprout feature' },
        ],
        changes: [
            'Added the first SkillSprout feature set for the app.',
        ],
    },
    {
        version: '0.2.0',
        date: '2026-02-22',
        title: 'NeuralNarrative foundation',
        summary: 'The first NeuralNarrative structure was added as an early product surface.',
        commits: [
            { hash: 'f157d68', label: 'Neural narrative initial structure' },
        ],
        changes: [
            'Created the initial NeuralNarrative page structure.',
        ],
    },
    {
        version: '0.1.0',
        date: '2025-12-08',
        title: 'Base platform features',
        summary: 'The initial working application took shape with dashboards, booking management, therapist notes, and backend-connected parent/admin views.',
        commits: [
            { hash: '41c707c', label: 'Patient dashboard with DB data, scheduling for receptionist, admin updates' },
            { hash: '1b18c1f', label: 'Modified receptionist manage booking' },
            { hash: '73dbb8f', label: 'Added session notes and therapist pages' },
        ],
        changes: [
            'Connected the parent dashboard to backend data.',
            'Added receptionist scheduling and booking management foundations.',
            'Introduced therapist session notes and supporting pages.',
            'Expanded early admin panel data handling.',
        ],
    },
];

const githubBase = 'https://github.com/elementaryrock/mini-project/commit/';

const ChangelogPage = () => {
    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_42%),linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_100%)] text-slate-900">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <div className="mb-8 flex items-center justify-between gap-4">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-blue-700 shadow-sm">
                            <Sparkles size={14} />
                            Product Changelog
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                            Release history below v1
                        </h1>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                            This page is based on the repository commit history and includes only valid product-facing changes from the GitHub project.
                        </p>
                    </div>

                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </Link>
                </div>

                <div className="grid gap-4 rounded-[28px] border border-white/70 bg-white/65 p-5 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:grid-cols-3 sm:p-6">
                    <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-200">Current Track</p>
                        <p className="mt-3 text-3xl font-extrabold">0.9.0</p>
                        <p className="mt-2 text-sm text-slate-300">Latest valid release before v1.</p>
                    </div>
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/80 px-5 py-4">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">Source</p>
                        <p className="mt-3 text-lg font-bold text-slate-900">GitHub commit history</p>
                        <p className="mt-2 text-sm text-slate-600">Repository entries were filtered to avoid placeholders, merges, tests, and document-only updates.</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-5 py-4">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Coverage</p>
                        <p className="mt-3 text-lg font-bold text-slate-900">0.1.0 to 0.9.0</p>
                        <p className="mt-2 text-sm text-slate-600">Tracks the app from initial platform work through booking and media improvements.</p>
                    </div>
                </div>

                <div className="relative mt-8 space-y-6 before:absolute before:left-5 before:top-0 before:h-full before:w-px before:bg-gradient-to-b before:from-blue-200 before:via-slate-200 before:to-transparent sm:before:left-7">
                    {releases.map((release) => (
                        <section key={release.version} className="relative pl-12 sm:pl-16">
                            <div className="absolute left-0 top-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg sm:h-14 sm:w-14">
                                <GitCommit size={18} />
                            </div>

                            <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white/85 shadow-[0_18px_60px_-34px_rgba(15,23,42,0.38)] backdrop-blur">
                                <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900 px-6 py-5 text-white">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-200">{release.date}</p>
                                            <h2 className="mt-2 text-2xl font-extrabold tracking-tight">{release.version}</h2>
                                            <p className="mt-1 text-sm font-medium text-slate-200">{release.title}</p>
                                        </div>
                                        <p className="max-w-2xl text-sm leading-6 text-slate-200">{release.summary}</p>
                                    </div>
                                </div>

                                <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.3fr_0.9fr]">
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Included changes</h3>
                                        <ul className="mt-3 space-y-3">
                                            {release.changes.map((change) => (
                                                <li key={change} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                                                    {change}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">GitHub references</h3>
                                        <div className="mt-3 space-y-3">
                                            {release.commits.map((commit) => (
                                                <a
                                                    key={commit.hash}
                                                    href={`${githubBase}${commit.hash}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-start justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50"
                                                >
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{commit.hash}</p>
                                                        <p className="mt-1 text-sm leading-5 text-slate-600">{commit.label}</p>
                                                    </div>
                                                    <ExternalLink size={16} className="mt-0.5 shrink-0 text-blue-700" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChangelogPage;
