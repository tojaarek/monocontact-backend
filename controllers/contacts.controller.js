const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
  countPages,
} = require('../service/contacts.service.js');
const { getUserById } = require('../service/users.service.js');

const getContacts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const favorite = req.query.favorite;
    const filter = { owner: req.user._id };
    if (favorite) {
      filter.favorite = true;
    }
    const totalCount = await countPages(filter);
    const contacts = await listContacts(filter, page, limit);
    if (contacts === null) {
      res.status(500).json({
        status: 'error',
        code: 500,
        message: 'Internal Server Error',
      });
    } else if (contacts.length === 0) {
      res.status(204).json({
        status: 'success',
        code: 204,
        message: 'No content',
        data: {
          contacts,
        },
      });
    } else {
      const totalPages = Math.ceil(totalCount / limit);
      res.status(200).json({
        status: 'success',
        code: 200,
        data: {
          page: page,
          totalPages: totalPages,
          perPage: limit,
          contacts,
        },
      });
    }
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

const getContact = async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const userId = req.user._id;
    const contact = await getContactById(contactId);
    if (contact === null) {
      res.status(404).json({
        status: 'fail',
        code: 404,
        message: 'Not found',
      });
    }
    if (contact.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'error',
        code: 403,
        message: 'Forbidden',
      });
    }

    res.status(200).json({
      status: 'success',
      code: 200,
      data: {
        contact,
      },
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

const createContact = async (req, res, next) => {
  try {
    const { _id } = req.user._id;
    const { name, email, phone } = req.body;
    const currentUser = await getUserById(_id);
    const contactData = {
      name,
      email,
      phone,
      owner: currentUser._id,
    };
    const newContact = await addContact(contactData, req.user);
    if (!name || !email || !phone) {
      const missingFields = [];
      if (!name) missingFields.push('name');
      if (!email) missingFields.push('email');
      if (!phone) missingFields.push('phone');
      res.status(400).json({
        status: 'error',
        code: 400,
        message: `Missing required field/s: ${missingFields.join(', ')}`,
      });
    }

    if (!newContact) {
      res.status(500).json({
        status: 'error',
        code: 500,
        message: 'Internal Server Error',
      });
    }

    res.status(201).json({
      status: 'success',
      code: 201,
      message: 'Created',
      data: {
        newContact,
      },
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const userId = req.user._id;
    const contact = await getContactById(contactId);
    if (contact === null) {
      res.status(404).json({
        status: 'fail',
        code: 404,
        message: 'Not found',
      });
    }
    if (contact.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'error',
        code: 403,
        message: 'Forbidden',
      });
    }
    await removeContact(req.params.contactId);
    res.status(200).json({
      status: 'success',
      code: 200,
      message: 'Contact deleted',
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

const changeContactData = async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const userId = req.user._id;
    const contact = await getContactById(contactId);
    if (contact === null) {
      res.status(404).json({
        status: 'fail',
        code: 404,
        message: 'Not found',
      });
    }
    if (contact.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'error',
        code: 403,
        message: 'Forbidden',
      });
    }

    const updatedContact = await updateContact(req.params.contactId, req.body);

    res.status(200).json({
      status: 'success',
      code: 200,
      message: 'Contact updated',
      data: {
        updatedContact,
      },
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

const changeFavorite = async (req, res, next) => {
  try {
    const { favorite } = req.body;
    const contactId = req.params.contactId;
    const userId = req.user._id;
    const contact = await getContactById(contactId);
    if (contact === null) {
      res.status(404).json({
        status: 'fail',
        code: 404,
        message: 'Not found',
      });
    }
    if (contact.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'error',
        code: 403,
        message: 'Forbidden',
      });
    }
    if (!favorite) {
      res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Missing field favorite',
      });
    }
    const updatedContact = await updateStatusContact(
      req.params.contactId,
      req.body
    );
    if (updatedContact) {
      res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Contact updated',
        data: {
          updatedContact,
        },
      });
    }
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

module.exports = {
  getContacts,
  getContact,
  createContact,
  deleteContact,
  changeContactData,
  changeFavorite,
};
