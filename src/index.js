import React from 'react'

import dayjs from 'dayjs'
import 'dayjs/locale/ru'


import styles from './styles.module.css'
import {
  getLocator,
  publish,
  subscribe,
  unsubscribe,
  HasRole,
  HasRoleID,
  unwrap,
  clean,
  If,
  IfElse,
  And,
  Or,
  uncapitalize,
  QueryParams,
  QueryFunc,
  QueryParam,
  ObjectToQueryParam,
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
  CREATEP,
  READP,
  READWITHP,
  UPDATEP,
  DELETEP,
  POSTP,
  POSTFormDataP,
  GETWITHP,
  GETP,
  equals,
  contextFilterToObject,
  contextFilterToQueryFilters,
  ContextFiltersToQueryFilters,
  queryFiltersToContextFilter,
  QueryFiltersToContextFilters,

  ObjectToContextFilters,
  queryFilterByItem,
  filterByItem,
  FilterToQueryParameters,
  QueryParametersToFilters,
  FennecError,
  errorCatch,
  errorAlert,
  messageError,
  arrayUnpack,
  upgradeInArray,
  createInArray,
  updateInArray,
  deleteInArray,
  triggerInArray,
  emptyInArray,
  undefinedInArray,
  createArrayInArray,
  updateArrayInArray,
  deleteArrayInArray,
  triggerArrayInArray,
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
  SetMetaProperties,
  GetMeta,

  updateInProperties,
  deleteInProperties,
  triggerInProperties,

  updateInPropertiesUUID,
  deleteInPropertiesUUID,
  triggerInPropertiesUUID,

  foreachInProperties,
  updatePropertiesInProperties,
  deletePropertiesInProperties,
  triggerPropertiesInProperties,

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
  isRequired,
  validator,
  formItemRules
} from './Tool'

import {
  AuthService,
  AuthProvider,
  useAuth,
  useNavigation,
  RequireAuth
} from './Auth'

import {
  UserConfigProvider
} from './UserConfig'

import {
  TranslateProvider
} from './Translate'

import {
  MetaProvider
} from './Meta'


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
  useMetaContext,
  useCollectionRef,
  useActionRef,
  FormObserverContext,
  useFormObserverContext,
  ClipboardContext,
  useClipboardContext
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
  SortingFieldsUI,
  FiltersFieldsUI,
  CollectionServer
} from './Components/Desktop/CollectionServer'

import { 
  CollectionByProperty
} from './Components/Desktop/CollectionByProperty'

import {
  DropdownAction
} from './Components/Desktop/DropdownAction'

import {
  ModelMobile
} from './Components/Mobile/ModelMobile'

import {
  SortingFieldsUIMobile,
  FiltersFieldsUIMobile,
  FilteringUIMobile,
  CollectionServerMobile
} from './Components/Mobile/CollectionServerMobile'

import {
  BlockHeaderMobile
} from './Components/Mobile/BlockHeaderMobile'

import {
  DropdownMobile
} from './Components/Mobile/DropdownMobile'

import {
  CalendarItem
} from './Components/Mobile/CalendarItem'

import { Overlay } from './Components/Overlay'
import {
  FieldPartialReplacement,
  FieldFullReplacement,
  ModelPartialReplacement,
  ModelFullReplacement,
  CollectionPartialReplacement,
  CollectionFullReplacement,
  useFieldFullReplacement,
  useFieldFullReplacementHelper,
  useFieldPartialReplacement,
  useFieldPartialReplacementHelper,
  useModelPartialReplacement,
  useModelPartialReplacementHelper,
  useModelFullReplacement,
  useModelFullReplacementHelper,
  useCollectionPartialReplacement,
  useCollectionPartialReplacementHelper,
  useCollectionFullReplacement,
  useCollectionFullReplacementHelper,
  FieldFullReplacementProvider,
  FieldPartialReplacementProvider,
  ModelPartialReplacementProvider,
  ModelFullReplacementProvider,
  CollectionPartialReplacementProvider,
  CollectionFullReplacementProvider
} from './ComponetsReplacement';


export {
  getLocator,
  publish,
  subscribe,
  unsubscribe,
  HasRole,
  HasRoleID,
  unwrap,
  clean,
  If,
  IfElse,
  And,
  Or,
  uncapitalize,
  QueryParams,
  QueryFunc,
  QueryParam,
  ObjectToQueryParam,
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
  CREATEP,
  READP,
  READWITHP,
  UPDATEP,
  DELETEP,
  POSTP,
  POSTFormDataP,
  GETWITHP,
  GETP,
  equals,
  
  contextFilterToObject,
  contextFilterToQueryFilters,
  ContextFiltersToQueryFilters,
  queryFiltersToContextFilter,
  QueryFiltersToContextFilters,

  ObjectToContextFilters,
  queryFilterByItem,
  filterByItem,
  FilterToQueryParameters,
  QueryParametersToFilters,
  FennecError,
  errorCatch,
  errorAlert,
  messageError,
  arrayUnpack,
  upgradeInArray,
  createInArray,
  updateInArray,
  deleteInArray,
  triggerInArray,
  emptyInArray,
  undefinedInArray,
  createArrayInArray,
  updateArrayInArray,
  deleteArrayInArray,
  triggerArrayInArray,
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
  SetMetaProperties,
  GetMeta,
  updateInProperties,
  deleteInProperties,
  triggerInProperties,
  updateInPropertiesUUID,
  deleteInPropertiesUUID,
  triggerInPropertiesUUID,
  foreachInProperties,
  updatePropertiesInProperties,
  deletePropertiesInProperties,
  triggerPropertiesInProperties,
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
  isRequired,
  validator,
  formItemRules
}
export {
  AuthService,
  AuthProvider,
  UserConfigProvider,
  TranslateProvider,
  MetaProvider,
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
  useCollectionRef,
  useActionRef,
  FormObserverContext,
  useFormObserverContext,
  ClipboardContext,
  useClipboardContext,

  Field,
  FieldMobile,
  Model,
  SortingFieldsUI,
  FiltersFieldsUI,
  CollectionServer,
  CollectionByProperty,
  DropdownAction,
  DropdownMobile,
  ModelMobile,
  SortingFieldsUIMobile,
  FiltersFieldsUIMobile,
  FilteringUIMobile,
  CollectionServerMobile,
  BlockHeaderMobile,
  CalendarItem,
  Overlay
}

export {
  FieldPartialReplacement,
  FieldFullReplacement,
  ModelPartialReplacement,
  ModelFullReplacement,
  CollectionPartialReplacement,
  CollectionFullReplacement,
  useFieldFullReplacement,
  useFieldFullReplacementHelper,
  useFieldPartialReplacement,
  useFieldPartialReplacementHelper,
  useModelPartialReplacement,
  useModelPartialReplacementHelper,
  useModelFullReplacement,
  useModelFullReplacementHelper,
  useCollectionPartialReplacement,
  useCollectionPartialReplacementHelper,
  useCollectionFullReplacement,
  useCollectionFullReplacementHelper,
  FieldFullReplacementProvider,
  FieldPartialReplacementProvider,
  ModelPartialReplacementProvider,
  ModelFullReplacementProvider,
  CollectionPartialReplacementProvider,
  CollectionFullReplacementProvider
} 

export const ExampleComponent = ({ text }) => {
  return <div className={styles.test}>Component: {text}</div>
}
