const { Contact } = require('../models/contact.model.js');

const listContacts = async (id, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const data = await Contact.find(id).limit(limit).skip(skip);
    return data;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

const getContactById = async (contactId) => {
  try {
    const data = await Contact.findById(contactId);
    return data;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

const removeContact = async (contactId) => {
  try {
    await Contact.findByIdAndDelete(contactId);
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

const addContact = async (body) => {
  try {
    const newContact = new Contact(body);
    const saveResult = await newContact.save();
    return saveResult;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

const updateContact = async (contactId, body) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(contactId, body, {
      new: true,
    });
    return updatedContact;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

const updateStatusContact = async (contactId, body) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(contactId, body, {
      new: true,
    });
    if (updatedContact) {
      return updatedContact;
    } else {
      return null;
    }
  } catch (error) {
    console.error(error.message);
  }
};

const countPages = async (filter) => {
  try {
    return await Contact.countDocuments(filter);
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
  countPages,
};
