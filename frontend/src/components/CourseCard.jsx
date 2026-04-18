import { motion } from 'framer-motion';
import { FiUser, FiStar } from 'react-icons/fi';

const CourseCard = ({
    provider = "DEVELOPMENTS",
    status = "Available",
    title,
    image,
    multiplier,
    points = "435,671",
    isCompleted = false,
    onToggleCompletion,
    onAction
}) => {
    // Generate a random high rating based on the title length or multiplier for realism
    const rating = Math.min(5.0, (4.5 + (title.length % 5) * 0.1)).toFixed(1);

    return (
        <motion.div
            onClick={onAction}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group bg-white dark:bg-slate-900 rounded-none p-3 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-full cursor-pointer transition-all hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]"
        >
            {/* Image Section - Notably, it has inner padding! */}
            {image && (
                <div className="w-full h-44 rounded-none relative overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                    <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    {isCompleted && (
                        <div className="absolute top-3 right-3 bg-white/95 text-emerald-600 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm">
                            Read
                        </div>
                    )}
                </div>
            )}

            {/* Content Section */}
            <div className="flex-1 flex flex-col px-1 pt-4 pb-2">
                {/* Meta Row: Tag & Rating */}
                <div className="flex items-center justify-between mb-3">
                    <span className="bg-[#f0f0ff] dark:bg-indigo-900/30 text-[#6a55fa] dark:text-indigo-400 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md">
                        {provider.substring(0, 14)}
                    </span>
                    <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{rating}</span>
                    </div>
                </div>
                
                {/* Title */}
                <h3 className="text-[14px] font-extrabold text-slate-900 dark:text-white leading-snug mb-4 line-clamp-2">
                    {title}
                </h3>

                {/* Footer Section */}
                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                        <FiUser size={13} strokeWidth={2.5} />
                        <span className="text-[10px] font-bold tracking-wide">{points} students</span>
                    </div>
                    {/* Pricing or Action logic replaces bottom right span */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleCompletion(); }}
                        className={`px-3 py-1.5 rounded w-auto font-black text-[10px] uppercase tracking-wider transition-colors border ${isCompleted ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-slate-100 dark:hover:bg-slate-800' : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                        {isCompleted ? 'Unmark' : 'Mark Read'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default CourseCard;
