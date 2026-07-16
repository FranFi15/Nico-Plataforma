import HomeAthlete from '../models/homeAthleteModel.js';

// @desc Get all home athletes
// @route GET /api/home-athletes
// @access Public
export const getHomeAthletes = async (req, res, next) => {
  try {
    const athletes = await HomeAthlete.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: athletes.length,
      data: athletes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create new home athlete
// @route POST /api/home-athletes
// @access Private/Admin
export const createHomeAthlete = async (req, res, next) => {
  try {
    const { fullname, url, order } = req.body;

    if (!fullname || !url) {
      res.status(400);
      throw new Error('Por favor, proporcione el nombre y la foto (url) del atleta');
    }

    const athlete = await HomeAthlete.create({
      fullname,
      url,
      order: order !== undefined ? order : 0,
    });

    res.status(201).json({
      success: true,
      message: 'Atleta creado con éxito',
      data: athlete,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update home athlete
// @route PUT /api/home-athletes/:id
// @access Private/Admin
export const updateHomeAthlete = async (req, res, next) => {
  try {
    const { fullname, url, order } = req.body;

    let athlete = await HomeAthlete.findById(req.params.id);

    if (!athlete) {
      res.status(404);
      throw new Error('Atleta no encontrado');
    }

    athlete.fullname = fullname !== undefined ? fullname : athlete.fullname;
    athlete.url = url !== undefined ? url : athlete.url;
    if (order !== undefined) athlete.order = order;

    const updatedAthlete = await athlete.save();

    res.status(200).json({
      success: true,
      message: 'Atleta actualizado con éxito',
      data: updatedAthlete,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete home athlete
// @route DELETE /api/home-athletes/:id
// @access Private/Admin
export const deleteHomeAthlete = async (req, res, next) => {
  try {
    const athlete = await HomeAthlete.findById(req.params.id);

    if (!athlete) {
      res.status(404);
      throw new Error('Atleta no encontrado');
    }

    await athlete.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Atleta eliminado con éxito',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Reorder home athletes
// @route PUT /api/home-athletes/reorder
// @access Private/Admin
export const reorderHomeAthletes = async (req, res, next) => {
  try {
    const { orderedIds } = req.body;

    if (!orderedIds || !Array.isArray(orderedIds)) {
      res.status(400);
      throw new Error('Debe proporcionar un arreglo de IDs ordenados');
    }

    for (let i = 0; i < orderedIds.length; i++) {
      await HomeAthlete.findByIdAndUpdate(orderedIds[i], { order: i });
    }

    res.status(200).json({
      success: true,
      message: 'Orden actualizado con éxito',
    });
  } catch (error) {
    next(error);
  }
};
