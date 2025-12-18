import { motion } from 'framer-motion';

/**
 * Skeleton loader components for better perceived performance
 */

export const TaskCardSkeleton = () => (
  <div className="animate-pulse rounded-2xl p-5 bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md border border-purple-700/30">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div className="h-3 w-16 bg-purple-700/50 rounded mb-2" />
        <div className="h-5 w-3/4 bg-purple-700/50 rounded mb-2" />
        <div className="h-4 w-1/2 bg-purple-700/30 rounded" />
      </div>
      <div className="w-6 h-6 bg-purple-700/50 rounded-full" />
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 w-24 bg-purple-700/30 rounded" />
      <div className="h-6 w-20 bg-purple-700/30 rounded" />
    </div>
    <div className="h-8 w-full bg-purple-700/30 rounded-lg" />
  </div>
);

export const DashboardCardSkeleton = () => (
  <div className="animate-pulse rounded-xl p-6 bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md border border-purple-700/30">
    <div className="h-6 w-3/4 bg-purple-700/50 rounded mb-4" />
    <div className="h-8 w-1/2 bg-purple-700/50 rounded mb-2" />
    <div className="h-4 w-full bg-purple-700/30 rounded" />
  </div>
);

export const StudySessionSkeleton = () => (
  <div className="animate-pulse rounded-xl p-4 bg-purple-900/40 border border-purple-700/30">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-purple-700/50 rounded-full" />
      <div className="flex-1">
        <div className="h-4 w-32 bg-purple-700/50 rounded mb-2" />
        <div className="h-3 w-24 bg-purple-700/30 rounded" />
      </div>
    </div>
    <div className="h-2 w-full bg-purple-700/30 rounded" />
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3">
      <div className="h-4 w-24 bg-purple-700/50 rounded" />
    </td>
    <td className="px-4 py-3">
      <div className="h-4 w-32 bg-purple-700/50 rounded" />
    </td>
    <td className="px-4 py-3">
      <div className="h-4 w-20 bg-purple-700/30 rounded" />
    </td>
    <td className="px-4 py-3">
      <div className="h-4 w-16 bg-purple-700/30 rounded" />
    </td>
  </tr>
);

export const ChartSkeleton = () => (
  <div className="animate-pulse rounded-xl p-6 bg-purple-900/40 border border-purple-700/30">
    <div className="h-6 w-48 bg-purple-700/50 rounded mb-4" />
    <div className="h-64 w-full bg-purple-700/30 rounded" />
  </div>
);

export default {
  TaskCardSkeleton,
  DashboardCardSkeleton,
  StudySessionSkeleton,
  TableRowSkeleton,
  ChartSkeleton
};

