const express = require('express');
const {
  contactValidationMiddleware,
} = require('../../middleware/contacts.validator.js');
const { authMiddleware } = require('../../auth/auth.service.js');
const {
  getContacts,
  getContact,
  createContact,
  deleteContact,
  changeContactData,
  changeFavorite,
} = require('../../controllers/contacts.controller.js');

const contactsRouter = express.Router();

contactsRouter.get('/', authMiddleware, getContacts);
contactsRouter.get('/:contactId', authMiddleware, getContact);
contactsRouter.post(
  '/',
  authMiddleware,
  contactValidationMiddleware,
  createContact
);
contactsRouter.delete('/:contactId', authMiddleware, deleteContact);
contactsRouter.put(
  '/:contactId',
  authMiddleware,
  contactValidationMiddleware,
  changeContactData
);
contactsRouter.patch('/:contactId/favorite', authMiddleware, changeFavorite);

module.exports = contactsRouter;
