import User from '../models/userModel.js';
import Content from '../models/contentModel.js';
import ZoomEvent from '../models/zoomEventModel.js';

// @desc    Get platform statistics
// @route   GET /api/stats
// @access  Private/Admin
export const getPlatformStats = async (req, res, next) => {
  try {
    // 1. User stats
    const totalUsers = await User.countDocuments({ role: { $in: ['student'] } });
    const premiumUsers = await User.countDocuments({ role: 'student', membership: 'premium' });
    const freeUsers = await User.countDocuments({ role: 'student', membership: 'free' });

    // 2. Enrolled students
    // Usuarios que tienen algo en purchasedItems
    const enrolledUsers = await User.countDocuments({ 
      role: 'student', 
      purchasedItems: { $exists: true, $not: { $size: 0 } }
    });

    // 3. Content stats
    const totalCourses = await Content.countDocuments({ contentType: 'course' });
    const totalWorkshops = await Content.countDocuments({ contentType: 'workshop' });
    const totalBlogs = await Content.countDocuments({ contentType: 'blog' });
    const totalVideoteca = await Content.countDocuments({ contentType: 'videoteca' });

    // 4. Zoom Events stats
    const totalZoomEvents = await ZoomEvent.countDocuments({ type: 'zoom' });

    // 5. Historical Stats (New users per month & New premium per month)
    const historyAgg = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $facet: {
          newUsers: [
            {
              $group: {
                _id: {
                  month: { $month: "$createdAt" },
                  year: { $year: "$createdAt" }
                },
                count: { $sum: 1 }
              }
            }
          ],
          newPremium: [
            { $match: { membership: 'premium' } },
            {
              $group: {
                _id: {
                  month: { $month: { $ifNull: ["$premiumSince", "$updatedAt"] } },
                  year: { $year: { $ifNull: ["$premiumSince", "$updatedAt"] } }
                },
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    
    // Combine facet results into a single history array mapped by "YYYY-MM"
    const historyMap = {};

    if (historyAgg.length > 0) {
      const { newUsers, newPremium } = historyAgg[0];

      newUsers.forEach(item => {
        const key = `${item._id.year}-${item._id.month}`;
        if (!historyMap[key]) historyMap[key] = { year: item._id.year, month: item._id.month, NuevosAlumnos: 0, NuevosPremium: 0 };
        historyMap[key].NuevosAlumnos = item.count;
      });

      newPremium.forEach(item => {
        const key = `${item._id.year}-${item._id.month}`;
        if (!historyMap[key]) historyMap[key] = { year: item._id.year, month: item._id.month, NuevosAlumnos: 0, NuevosPremium: 0 };
        historyMap[key].NuevosPremium = item.count;
      });
    }

    const history = Object.values(historyMap)
      .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
      .map(item => ({
        name: `${monthNames[item.month - 1]} ${item.year}`,
        NuevosAlumnos: item.NuevosAlumnos,
        NuevosPremium: item.NuevosPremium
      }));

    // 6. Course Enrollments Breakdown
    const enrollmentsAgg = await User.aggregate([
      { $match: { role: 'student', purchasedItems: { $exists: true, $not: { $size: 0 } } } },
      { $unwind: "$purchasedItems" },
      { $group: { _id: "$purchasedItems", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const contentDocs = await Content.find(
      { _id: { $in: enrollmentsAgg.map(e => e._id) } },
      'title contentType'
    );

    const enrollmentsBreakdown = enrollmentsAgg.map(agg => {
      const content = contentDocs.find(c => c._id.toString() === agg._id.toString());
      return {
        id: agg._id,
        title: content ? content.title : 'Contenido Eliminado o Desconocido',
        contentType: content ? content.contentType : 'unknown',
        count: agg.count
      };
    }).filter(e => e.contentType === 'course' || e.contentType === 'workshop');

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          premium: premiumUsers,
          free: freeUsers,
          enrolled: enrolledUsers
        },
        content: {
          courses: totalCourses,
          workshops: totalWorkshops,
          blogs: totalBlogs,
          videoteca: totalVideoteca
        },
        events: {
          zoom: totalZoomEvents
        },
        history,
        enrollmentsBreakdown
      }
    });

  } catch (error) {
    next(error);
  }
};
