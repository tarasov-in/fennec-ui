import React from 'react'
import styles from './styles.module.css'
import {
  publish,
  subscribe,
  unsubscribe,
  HasRole,
  HasRoleID,
  unwrap,
  If,
  IfElse,
  And,
  Or,
  uncapitalize,
  QueryParams,
  QueryFunc,
  QueryParam,
  QueryOrder,
  QueryDetail,
  CREATE,
  READ,
  READWITH,
  UPDATE,
  DELETE,
  POST,
  POSTFormData,
  GETWITH,
  GET,
  equals,
  queryFilterByItem,
  filterByItem,
  errorCatch,
  errorAlert,
  messageError,
  arrayUnpack,
  upgradeInArray,
  createInArray,
  updateInArray,
  deleteInArray,
  emptyInArray,
  undefinedInArray,
  makeFormData,
  unpackFormFields,
  preventDefault,
  eventExecution,
  detectMutation,
  Request,
  pushStateHistoryModal,
  ycStorage,
  JSX,
  JSXMap,
  JSXPathMap,
  JSXIndex,
  GetMetaPropertyByPath,
  GetMetaProperties,
  GetMeta,
  getObjectValue,
  getObjectValueOrDefault,
  getObjectDisplay,
  getFieldDisplay,
  getDisplay,
  metaGetCloneObject,
  metaGetFieldByName,
  getSortingDisplayFields,
  typeIsNumber,
  getFormatFieldValueTableView,
  priceFormat,
  MetaColumns
} from './Tool'

import {
  AuthService,
  AuthProvider,
  useAuth,
  useNavigation,
  RequireAuth
} from './Auth'

import {
  ActionPickerItem,
  FooterButton,
  Action
} from './Components/Action'

import {
  UserContext,
  useUserContext,
  UserConfigContext,
  useUserConfigContext,
  TranslateContext,
  useTranslateContext,
  MetaContext,
  useMetaContext
} from './Components/Context'

import {
  Field
} from './Components/Desktop/Field'

import {
  FieldMobile
} from './Components/Mobile/FieldMobile'

import {
  Model
} from './Components/Desktop/Model'

import {
  CollectionServer
} from './Components/Desktop/CollectionServer'

import {
  DropdownAction
} from './Components/Desktop/DropdownAction'

export {
  publish,
  subscribe,
  unsubscribe,
  HasRole,
  HasRoleID,
  unwrap,
  If,
  IfElse,
  And,
  Or,
  uncapitalize,
  QueryParams,
  QueryFunc,
  QueryParam,
  QueryOrder,
  QueryDetail,
  CREATE,
  READ,
  READWITH,
  UPDATE,
  DELETE,
  POST,
  POSTFormData,
  GETWITH,
  GET,
  equals,
  queryFilterByItem,
  filterByItem,
  errorCatch,
  errorAlert,
  messageError,
  arrayUnpack,
  upgradeInArray,
  createInArray,
  updateInArray,
  deleteInArray,
  emptyInArray,
  undefinedInArray,
  makeFormData,
  unpackFormFields,
  preventDefault,
  eventExecution,
  detectMutation,
  Request,
  pushStateHistoryModal,
  ycStorage,
  JSX,
  JSXMap,
  JSXPathMap,
  JSXIndex,
  GetMetaPropertyByPath,
  GetMetaProperties,
  GetMeta,
  getObjectValue,
  getObjectValueOrDefault,
  getObjectDisplay,
  getFieldDisplay,
  getDisplay,
  metaGetCloneObject,
  metaGetFieldByName,
  getSortingDisplayFields,
  typeIsNumber,
  getFormatFieldValueTableView,
  priceFormat,
  MetaColumns,
}
export {
  AuthService,
  AuthProvider,
  useAuth,
  useNavigation,
  RequireAuth,

  ActionPickerItem,
  FooterButton,
  Action,

  UserContext,
  useUserContext,
  UserConfigContext,
  useUserConfigContext,
  TranslateContext,
  useTranslateContext,
  MetaContext,
  useMetaContext,

  Field,
  FieldMobile,
  Model,
  CollectionServer,
  DropdownAction
}

// export const ExampleComponent = ({ text }) => {
//   return <div className={styles.test}>Component: {text}</div>
// }
