/*
  A stable identifier (`stableId` prop) provides a unique query selector for actionable DOM elements.
  This is helpful for tracking DOM events via FullStory as well as assisting in E2E testing. It's important
  that each `stableId` be unique throughout the app. This is accomplished using the following enum.

  Whenever using a component that requires a `stableId` prop, create a new enum entry for your component
  (please take care to alphabetize your new entry properly).

  For example: if you're working on a component named `DeleteProjectModal.tsx` and you're rendering a
  `Button` component that deletes the project once clicked, you could create a `StableId` enum value for
  `DELETE_PROJECT_MODAL_CONFIRM_BUTTON`.
*/

export const enum StableId {
  ACCEPT_ORGANIZATION_INVITE_PROJECTS_BUTTON = 'ACCEPT_ORGANIZATION_INVITE_PROJECTS_BUTTON',
  ACCOUNT_VERIFICATION_LOG_OUT_BUTTON = 'ACCOUNT_VERIFICATION_LOG_OUT_BUTTON',
  ACCOUNT_VERIFICATION_SEND_AGAIN_BUTTON = 'ACCOUNT_VERIFICATION_SEND_AGAIN_BUTTON',
  ADD_CONTRACT_FORM_ADDRESS_INPUT = 'ADD_CONTRACT_FORM_ADDRESS_INPUT',
  ADD_CONTRACT_FORM_CONFIRM_BUTTON = 'ADD_CONTRACT_FORM_CONFIRM_BUTTON',
  ADD_CONTRACT_FORM_TEMPLATE_BACK_BUTTON = 'ADD_CONTRACT_FORM_TEMPLATE_BACK_BUTTON',
  ALERT_ACTIVE_SWITCH = 'ALERT_ACTIVE_SWITCH',
  ALERT_ACTIVITY_LINK = 'ALERT_ACTIVITY_LINK',
  ALERT_BACK_TO_ALERTS_LINK = 'ALERT_BACK_TO_ALERTS_LINK',
  ALERT_EDIT_ALERT_NAME_BUTTON = 'ALERT_EDIT_ALERT_NAME_BUTTON',
  ALERT_EDIT_ALERT_NAME_INPUT = 'ALERT_EDIT_ALERT_NAME_INPUT',
  ALERT_OPEN_DELETE_ALERT_MODAL_BUTTON = 'ALERT_OPEN_DELETE_ALERT_MODAL_BUTTON',
  ALERT_SAVE_ALERT_NAME_BUTTON = 'ALERT_SAVE_ALERT_NAME_BUTTON',
  ALERT_TABLE_ROW_OPEN_DELETE_MODAL_BUTTON = 'ALERT_TABLE_ROW_OPEN_DELETE_MODAL_BUTTON',
  ALERTS_NEW_ALERT_LINK = 'ALERTS_NEW_ALERT_LINK',
  ALERTS_TABS_ACTIVITY_LINK = 'ALERTS_TABS_ACTIVITY_LINK',
  ALERTS_TABS_ALERTS_LINK = 'ALERTS_TABS_ALERTS_LINK',
  ALERTS_TABS_DESTINATIONS_LINK = 'ALERTS_TABS_DESTINATIONS_LINK',
  API_KEYS_COPY_KEY_BUTTON = 'API_KEYS_COPY_KEY_BUTTON',
  API_KEYS_OPEN_CREATE_MODAL_BUTTON = 'API_KEYS_OPEN_CREATE_MODAL_BUTTON',
  API_KEYS_OPEN_ROTATE_MODAL_BUTTON = 'API_KEYS_OPEN_ROTATE_MODAL_BUTTON',
  API_KEYS_REVEAL_KEY_TOGGLE_BUTTON = 'API_KEYS_REVEAL_KEY_TOGGLE_BUTTON',
  API_STATS_LIVE_UPDATES_SWITCH = 'API_STATS_LIVE_UPDATES_SWITCH',
  API_STATS_TIME_RANGE_DROPDOWN = 'API_STATS_TIME_RANGE_DROPDOWN',
  APIS_TABS_ENHANCED_API_LINK = 'APIS_TABS_ENHANCED_API_LINK',
  APIS_TABS_EXPLORER_LINK = 'APIS_TABS_EXPLORER_LINK',
  APIS_TABS_KEYS_LINK = 'APIS_TABS_KEYS_LINK',
  APIS_TABS_STATISTICS_LINK = 'APIS_TABS_STATISTICS_LINK',
  AUTHENTICATION_EMAIL_FORM_EMAIL_INPUT = 'AUTHENTICATION_EMAIL_FORM_EMAIL_INPUT',
  AUTHENTICATION_EMAIL_FORM_FORGOT_PASSWORD_BUTTON = 'AUTHENTICATION_EMAIL_FORM_FORGOT_PASSWORD_BUTTON',
  AUTHENTICATION_EMAIL_FORM_PASSWORD_INPUT = 'AUTHENTICATION_EMAIL_FORM_PASSWORD_INPUT',
  AUTHENTICATION_EMAIL_FORM_SIGN_IN_BUTTON = 'AUTHENTICATION_EMAIL_FORM_SIGN_IN_BUTTON',
  AUTHENTICATION_EMAIL_FORM_SIGN_UP_BUTTON = 'AUTHENTICATION_EMAIL_FORM_SIGN_UP_BUTTON',
  AUTHENTICATION_FORM_SIGN_IN_WITH_GITHUB_BUTTON = 'AUTHENTICATION_FORM_SIGN_IN_WITH_GITHUB_BUTTON',
  AUTHENTICATION_FORM_SIGN_IN_WITH_GOOGLE_BUTTON = 'AUTHENTICATION_FORM_SIGN_IN_WITH_GOOGLE_BUTTON',
  CODE_BLOCK_COPY_BUTTON = 'CODE_BLOCK_COPY_BUTTON',
  COMBOBOX_TOGGLE_BUTTON = 'COMBOBOX_TOGGLE_BUTTON',
  CONFIRM_MODAL_CANCEL_BUTTON = 'CONFIRM_MODAL_CANCEL_BUTTON',
  CONFIRM_MODAL_CONFIRM_BUTTON = 'CONFIRM_MODAL_CONFIRM_BUTTON',
  CONTRACT_ADDRESS_DROPDOWN = 'CONTRACT_ADDRESS_DROPDOWN',
  CONTRACT_BACK_TO_CONTRACTS_LINK = 'CONTRACT_BACK_TO_CONTRACTS_LINK',
  CONTRACT_INTERACT_NEAR_ABI_DOCS_LINK = 'CONTRACT_INTERACT_NEAR_ABI_DOCS_LINK',
  CONTRACT_OPEN_REMOVE_MODAL_BUTTON = 'CONTRACT_OPEN_REMOVE_MODAL_BUTTON',
  CONTRACT_TABS_ABI_LINK = 'CONTRACT_TABS_ABI_LINK',
  CONTRACT_TABS_DETAILS_LINK = 'CONTRACT_TABS_DETAILS_LINK',
  CONTRACT_TABS_INTERACT_LINK = 'CONTRACT_TABS_INTERACT_LINK',
  CONTRACT_TEMPLATE_DETAILS_DEPLOY_BUTTON = 'CONTRACT_TEMPLATE_DETAILS_DEPLOY_BUTTON',
  CONTRACT_TEMPLATE_DETAILS_GITHUB_LINK = 'CONTRACT_TEMPLATE_DETAILS_GITHUB_LINK',
  CONTRACT_TRANSACTION_CONNECT_WALLET_BUTTON = 'CONTRACT_TRANSACTION_CONNECT_WALLET_BUTTON',
  CONTRACT_TRANSACTION_GAS_FORMAT_DROPDOWN = 'CONTRACT_TRANSACTION_GAS_FORMAT_DROPDOWN',
  CONTRACT_TRANSACTION_MAX_GAS_BUTTON = 'CONTRACT_TRANSACTION_MAX_GAS_BUTTON',
  CONTRACT_TRANSACTION_NEAR_FORMAT_DROPDOWN = 'CONTRACT_TRANSACTION_NEAR_FORMAT_DROPDOWN',
  CONTRACT_TRANSACTION_SEND_BUTTON = 'CONTRACT_TRANSACTION_SEND_BUTTON',
  CONTRACT_TRANSACTION_VIEW_CALL_BUTTON = 'CONTRACT_TRANSACTION_VIEW_CALL_BUTTON',
  CONTRACTS_OPEN_ADD_CONTRACT_MODAL_BUTTON = 'CONTRACTS_OPEN_ADD_CONTRACT_MODAL_BUTTON',
  CONTRACTS_OPEN_ADD_CONTRACT_MODAL_TEXT_BUTTON = 'CONTRACTS_OPEN_ADD_CONTRACT_MODAL_TEXT_BUTTON',
  CONTRACTS_OPEN_SHARE_CONTRACTS_MODAL_BUTTON = 'CONTRACTS_OPEN_SHARE_CONTRACTS_MODAL_BUTTON',
  CREATE_API_KEY_FORM_CANCEL_BUTTON = 'CREATE_API_KEY_FORM_CANCEL_BUTTON',
  CREATE_API_KEY_FORM_CONFIRM_BUTTON = 'CREATE_API_KEY_FORM_CONFIRM_BUTTON',
  CREATE_API_KEY_FORM_DESCRIPTION_INPUT = 'CREATE_API_KEY_FORM_DESCRIPTION_INPUT',
  CREATE_ORGANIZATION_CANCEL_SAVE_BUTTON = 'CREATE_ORGANIZATION_CANCEL_SAVE_BUTTON',
  CREATE_ORGANIZATION_NAME_INPUT = 'CREATE_ORGANIZATION_NAME_INPUT',
  CREATE_ORGANIZATION_SAVE_BUTTON = 'CREATE_ORGANIZATION_SAVE_BUTTON',
  DELETE_ACCOUNT_MODAL_ORGANIZATION_LINK = 'DELETE_ACCOUNT_MODAL_ORGANIZATION_LINK',
  DEPLOYS_CODE = 'DEPLOYS_CODE',
  DEPLOYS_GITHUB_REPO = 'DEPLOYS_GITHUB_REPO',
  DEPLOYS_HISTORY_FILTER = 'DEPLOYS_HISTORY_FILTER',
  DEPLOYS_HISTORY_RECORD = 'DEPLOYS_HISTORY_RECORD',
  DEPLOYS_TESTNET_ALERTS = 'DEPLOYS_TESTNET_ALERTS',
  DEPLOYS_TESTNET_INTERACT = 'DEPLOYS_TESTNET_INTERACT',
  DEPLOYS_TESTNET_MORE = 'DEPLOYS_TESTNET_MORE',
  DEPLOYS_TESTNET_REPO = 'DEPLOYS_TESTNET_REPO',
  DESTINATIONS_OPEN_CREATE_MODAL_BUTTON = 'DESTINATIONS_OPEN_CREATE_MODAL_BUTTON',
  DESTINATIONS_SELECTOR_OPEN_CREATE_MODAL_BUTTON = 'DESTINATIONS_SELECTOR_OPEN_CREATE_MODAL_BUTTON',
  DESTINATIONS_SELECTOR_OPEN_EDIT_MODAL_BUTTON = 'DESTINATIONS_SELECTOR_OPEN_EDIT_MODAL_BUTTON',
  DESTINATIONS_SELECTOR_SELECTED_SWITCH = 'DESTINATIONS_SELECTOR_SELECTED_SWITCH',
  DESTINATIONS_TABLE_ROW_OPEN_DELETE_MODAL_BUTTON = 'DESTINATIONS_TABLE_ROW_OPEN_DELETE_MODAL_BUTTON',
  EDIT_DESTINATION_MODAL_CANCEL_BUTTON = 'EDIT_DESTINATION_MODAL_CANCEL_BUTTON',
  EDIT_DESTINATION_MODAL_NAME_INPUT = 'EDIT_DESTINATION_MODAL_NAME_INPUT',
  EDIT_DESTINATION_MODAL_OPEN_DELETE_MODAL_BUTTON = 'EDIT_DESTINATION_MODAL_OPEN_DELETE_MODAL_BUTTON',
  EDIT_DESTINATION_MODAL_UPDATE_BUTTON = 'EDIT_DESTINATION_MODAL_UPDATE_BUTTON',
  EDIT_DESTINATION_MODAL_WEBHOOK_URL_INPUT = 'EDIT_DESTINATION_MODAL_WEBHOOK_URL_INPUT',
  EMAIL_DESTINATION_VERIFICATION_RESEND_BUTTON = 'EMAIL_DESTINATION_VERIFICATION_RESEND_BUTTON',
  ENVIRONMENT_SELECTOR_DROPDOWN = 'ENVIRONMENT_SELECTOR_DROPDOWN',
  ERROR_MODAL_DISMISS_BUTTON = 'ERROR_MODAL_DISMISS_BUTTON',
  FOOTER_COPY_AUTH_TOKEN = 'FOOTER_COPY_AUTH_TOKEN',
  FOOTER_PAGODA_DOCS_LINK = 'FOOTER_PAGODA_DOCS_LINK',
  FOOTER_PAGODA_STATUS_LINK = 'FOOTER_PAGODA_STATUS_LINK',
  FOOTER_PRIVACY_POLICY_LINK = 'FOOTER_PRIVACY_POLICY_LINK',
  FOOTER_TERMS_OF_USE_LINK = 'FOOTER_TERMS_OF_USE_LINK',
  FORGOT_PASSWORD_MODAL_CANCEL_BUTTON = 'FORGOT_PASSWORD_MODAL_CANCEL_BUTTON',
  FORGOT_PASSWORD_MODAL_EMAIL_INPUT = 'FORGOT_PASSWORD_MODAL_EMAIL_INPUT',
  FORGOT_PASSWORD_MODAL_FINISH_BUTTON = 'FORGOT_PASSWORD_MODAL_FINISH_BUTTON',
  FORGOT_PASSWORD_MODAL_SEND_RESET_EMAIL_BUTTON = 'FORGOT_PASSWORD_MODAL_SEND_RESET_EMAIL_BUTTON',
  GALLERY_FILTER_TOOLS = 'GALLERY_FILTER_TOOLS',
  GALLERY_LIKE = 'GALLERY_LIKE',
  GALLERY_REQUEST_A_TEMPLATE = 'GALLERY_REQUEST_A_TEMPLATE',
  GALLERY_RUN_EXAMPLE = 'GALLERY_RUN_EXAMPLE',
  GALLERY_SORT_BY_DROPDOWN = 'GALLERY_SORT_BY_DROPDOWN',
  GALLERY_TAGS = 'GALLERY_TAGS',
  GALLERY_USE_TEMPLATE = 'GALLERY_USE_TEMPLATE',
  GALLERY_VIEW_SOURCE = 'GALLERY_VIEW_SOURCE',
  HEADER_EXIT_PUBLIC_CONTRACTS_BUTTON = 'HEADER_EXIT_PUBLIC_CONTRACTS_BUTTON',
  HEADER_SIGN_IN_LINK = 'HEADER_SIGN_IN_LINK',
  INDEXERS_NEAR_LAKE_ACCOUNT_WATCHER_LINK = 'INDEXERS_NEAR_LAKE_ACCOUNT_WATCHER_LINK',
  INDEXERS_NEAR_LAKE_NFT_INDEXER_LINK = 'INDEXERS_NEAR_LAKE_NFT_INDEXER_LINK',
  INDEXERS_NEAR_LAKE_RAW_PRINTER_LINK = 'INDEXERS_NEAR_LAKE_RAW_PRINTER_LINK',
  INDEXERS_TRY_NEAR_LAKE_LINK = 'INDEXERS_TRY_NEAR_LAKE_LINK',
  MESSAGE_DISMISS_BUTTON = 'MESSAGE_DISMISS_BUTTON',
  NEW_ALERT_ACCT_BAL_NUM_FROM_INPUT = 'NEW_ALERT_ACCT_BAL_NUM_FROM_INPUT',
  NEW_ALERT_ACCT_BAL_NUM_TO_INPUT = 'NEW_ALERT_ACCT_BAL_NUM_TO_INPUT',
  NEW_ALERT_ACCT_BAL_PCT_FROM_INPUT = 'NEW_ALERT_ACCT_BAL_PCT_FROM_INPUT',
  NEW_ALERT_ACCT_BAL_PCT_TO_INPUT = 'NEW_ALERT_ACCT_BAL_PCT_TO_INPUT',
  NEW_ALERT_ADDRESS_INPUT = 'NEW_ALERT_ADDRESS_INPUT',
  NEW_ALERT_BACK_TO_ALERTS_LINK = 'NEW_ALERT_BACK_TO_ALERTS_LINK',
  NEW_ALERT_CANCEL_BUTTON = 'NEW_ALERT_CANCEL_BUTTON',
  NEW_ALERT_COMPARATOR_SELECT = 'NEW_ALERT_COMPARATOR_SELECT',
  NEW_ALERT_CONDITION_SELECT = 'NEW_ALERT_CONDITION_SELECT',
  NEW_ALERT_CREATE_BUTTON = 'NEW_ALERT_CREATE_BUTTON',
  NEW_ALERT_EVENT_NAME_INPUT = 'NEW_ALERT_EVENT_NAME_INPUT',
  NEW_ALERT_EVENT_STANDARD_INPUT = 'NEW_ALERT_EVENT_STANDARD_INPUT',
  NEW_ALERT_EVENT_VERSION_INPUT = 'NEW_ALERT_EVENT_VERSION_INPUT',
  NEW_ALERT_FN_CALL_FUNCTION_NAME_INPUT = 'NEW_ALERT_FN_CALL_FUNCTION_NAME_INPUT',
  NEW_DESTINATION_MODAL_CANCEL_BUTTON = 'NEW_DESTINATION_MODAL_CANCEL_BUTTON',
  NEW_DESTINATION_MODAL_CREATE_BUTTON = 'NEW_DESTINATION_MODAL_CREATE_BUTTON',
  NEW_DESTINATION_MODAL_EMAIL_INPUT = 'NEW_DESTINATION_MODAL_EMAIL_INPUT',
  NEW_DESTINATION_MODAL_FINISH_WEBHOOK_BUTTON = 'NEW_DESTINATION_MODAL_FINISH_WEBHOOK_BUTTON',
  NEW_DESTINATION_MODAL_WEBHOOK_URL_INPUT = 'NEW_DESTINATION_MODAL_WEBHOOK_URL_INPUT',
  NEW_NFT_TUTORIAL_BACK_TO_TUTORIAL_TYPE_LINK = 'NEW_NFT_TUTORIAL_BACK_TO_TUTORIAL_TYPE_LINK',
  NEW_NFT_TUTORIAL_CREATE_BUTTON = 'NEW_NFT_TUTORIAL_CREATE_BUTTON',
  NEW_NFT_TUTORIAL_PROJECT_NAME_INPUT = 'NEW_NFT_TUTORIAL_PROJECT_NAME_INPUT',
  NEW_PROJECT_BACK_TO_PROJECT_TYPE_LINK = 'NEW_PROJECT_BACK_TO_PROJECT_TYPE_LINK',
  NEW_PROJECT_CREATE_BUTTON = 'NEW_PROJECT_CREATE_BUTTON',
  NEW_PROJECT_NAME_INPUT = 'NEW_PROJECT_NAME_INPUT',
  NEW_PROJECT_ORGANIZATION_SELECT = 'NEW_PROJECT_ORGANIZATION_SELECT',
  NFT_INFO_CARD_ADDRESS_INPUT = 'NFT_INFO_CARD_ADDRESS_INPUT',
  NFT_INFO_CARD_EDIT_BUTTON = 'NFT_INFO_CARD_EDIT_BUTTON',
  NFT_INFO_CARD_ENUMERATION_DOCS_LINK = 'NFT_INFO_CARD_ENUMERATION_DOCS_LINK',
  NFT_INFO_CARD_SAVE_BUTTON = 'NFT_INFO_CARD_SAVE_BUTTON',
  NFT_INFO_CARD_TOKEN_ACCORDION_TRIGGER = 'NFT_INFO_CARD_TOKEN_ACCORDION_TRIGGER',
  ORGANIZATION_ADD_USER_BUTTON = 'ORGANIZATION_ADD_USER_BUTTON',
  ORGANIZATION_CANCEL_ADD_USER_BUTTON = 'ORGANIZATION_CANCEL_ADD_USER_BUTTON',
  ORGANIZATION_INVITE_EMAIL_INPUT = 'ORGANIZATION_INVITE_EMAIL_INPUT',
  ORGANIZATION_INVITE_ROLE_SELECT = 'ORGANIZATION_INVITE_ROLE_SELECT',
  ORGANIZATION_MEMBER_ROLE_DROPDOWN = 'ORGANIZATION_MEMBER_ROLE_DROPDOWN',
  ORGANIZATION_OPEN_ADD_MEMBER_MODAL_BUTTON = 'ORGANIZATION_OPEN_ADD_MEMBER_MODAL_BUTTON',
  ORGANIZATION_OPEN_DELETE_ORGANIZATION_MODAL_BUTTON = 'ORGANIZATION_OPEN_DELETE_ORGANIZATION_MODAL_BUTTON',
  ORGANIZATION_REFETCH_BUTTON = 'ORGANIZATION_REFETCH_BUTTON',
  ORGANIZATION_SELECT = 'ORGANIZATION_SELECT',
  ORGANIZATIONS_REFETCH_BUTTON = 'ORGANIZATIONS_REFETCH_BUTTON',
  PAGINATION_NEXT_PAGE_BUTTON = 'PAGINATION_NEXT_PAGE_BUTTON',
  PAGINATION_PREV_PAGE_BUTTON = 'PAGINATION_PREV_PAGE_BUTTON',
  PROJECT_ANALYTICS_NO_CONTRACTS_BUTTON_LINK = 'PROJECT_ANALYTICS_NO_CONTRACTS_BUTTON_LINK',
  PROJECT_ANALYTICS_NO_CONTRACTS_LINK = 'PROJECT_ANALYTICS_NO_CONTRACTS_LINK',
  PROJECT_SELECTOR_CREATE_NEW_PROJECT_BUTTON = 'PROJECT_SELECTOR_CREATE_NEW_PROJECT_BUTTON',
  PROJECT_SELECTOR_DROPDOWN = 'PROJECT_SELECTOR_DROPDOWN',
  PROJECT_SETTINGS_CREATE_ORGANIZATION_LINK = 'PROJECT_SETTINGS_CREATE_ORGANIZATION_LINK',
  PROJECT_SETTINGS_INVITE_ORGANIZATION_LINK = 'PROJECT_SETTINGS_INVITE_ORGANIZATION_LINK',
  PROJECT_SETTINGS_OPEN_DELETE_PROJECT_MODAL = 'PROJECT_SETTINGS_OPEN_DELETE_PROJECT_MODAL',
  PROJECT_SETTINGS_VIEW_API_KEYS_LINK = 'PROJECT_SETTINGS_VIEW_API_KEYS_LINK',
  PROJECT_SETTINGS_VIEW_PROJECTS_LINK = 'PROJECT_SETTINGS_VIEW_PROJECTS_LINK',
  PROJECT_TEMPLATE_BACK_TO_TEMPLATES_LINK = 'PROJECT_TEMPLATE_BACK_TO_TEMPLATES_LINK',
  PROJECT_TEMPLATES_BACK_TO_PROJECT_TYPE_LINK = 'PROJECT_TEMPLATES_BACK_TO_PROJECT_TYPE_LINK',
  PROJECT_TYPE_BACK_TO_PROJECTS_LINK = 'PROJECT_TYPE_BACK_TO_PROJECTS_LINK',
  PROJECTS_CREATE_PROJECT_LINK = 'PROJECTS_CREATE_PROJECT_LINK',
  PROJECTS_EDIT_TOGGLE_BUTTON = 'PROJECTS_EDIT_TOGGLE_BUTTON',
  PROJECTS_OPEN_DELETE_PROJECT_MODAL = 'PROJECTS_OPEN_DELETE_PROJECT_MODAL',
  PUBLIC_INVALID_URL_HOME_LINK = 'PUBLIC_INVALID_URL_HOME_LINK',
  RECEIPT_INFO_TABS_INPUT_TRIGGER = 'RECEIPT_INFO_TABS_INPUT_TRIGGER',
  RECEIPT_INFO_TABS_OUTPUT_TRIGGER = 'RECEIPT_INFO_TABS_OUTPUT_TRIGGER',
  RECEIPT_KIND_EXPAND_BUTTON = 'RECEIPT_KIND_EXPAND_BUTTON',
  REGISTER_CONFIRM_PASSWORD_INPUT = 'REGISTER_CONFIRM_PASSWORD_INPUT',
  REGISTER_DISPLAY_NAME_INPUT = 'REGISTER_DISPLAY_NAME_INPUT',
  REGISTER_EMAIL_INPUT = 'REGISTER_EMAIL_INPUT',
  REGISTER_PASSWORD_INPUT = 'REGISTER_PASSWORD_INPUT',
  REGISTER_SIGN_IN_LINK = 'REGISTER_SIGN_IN_LINK',
  REGISTER_SIGN_UP_BUTTON = 'REGISTER_SIGN_UP_BUTTON',
  SHARE_CONTRACTS_COPY_LINK_BUTTON = 'SHARE_CONTRACTS_COPY_LINK_BUTTON',
  SHARE_CONTRACTS_NEAR_ABI_DOCS_LINK = 'SHARE_CONTRACTS_NEAR_ABI_DOCS_LINK',
  SHARE_CONTRACTS_SEND_LINK_BUTTON = 'SHARE_CONTRACTS_SEND_LINK_BUTTON',
  SIDEBAR_ALERTS_LINK = 'SIDEBAR_ALERTS_LINK',
  SIDEBAR_ANALYTICS_LINK = 'SIDEBAR_ANALYTICS_LINK',
  SIDEBAR_APIS_LINK = 'SIDEBAR_APIS_LINK',
  SIDEBAR_DEPLOYS_LINK = 'SIDEBAR_DEPLOYS_LINK',
  SIDEBAR_CONTRACTS_LINK = 'SIDEBAR_CONTRACTS_LINK',
  SIDEBAR_INDEXERS_LINK = 'SIDEBAR_INDEXERS_LINK',
  SIDEBAR_PROJECT_SETTINGS_LINK = 'SIDEBAR_PROJECT_SETTINGS_LINK',
  SIDEBAR_TUTORIAL_LINK = 'SIDEBAR_TUTORIAL_LINK',
  STARTER_GUIDE_ACCORDION_CLI_TRIGGER = 'STARTER_GUIDE_ACCORDION_CLI_TRIGGER',
  STARTER_GUIDE_ACCORDION_JS_API_VS_SDK_TRIGGER = 'STARTER_GUIDE_ACCORDION_JS_API_VS_SDK_TRIGGER',
  STARTER_GUIDE_ACCORDION_JS_TRIGGER = 'STARTER_GUIDE_ACCORDION_JS_TRIGGER',
  STARTER_GUIDE_ACCORDION_RUST_TRIGGER = 'STARTER_GUIDE_ACCORDION_RUST_TRIGGER',
  STARTER_GUIDE_ACCORDION_TEST_KEYS_TRIGGER = 'STARTER_GUIDE_ACCORDION_TEST_KEYS_TRIGGER',
  STARTER_GUIDE_NEAR_API_DOCS_LINK = 'STARTER_GUIDE_NEAR_API_DOCS_LINK',
  STARTER_GUIDE_NEAR_API_JS_DOCS_LINK = 'STARTER_GUIDE_NEAR_API_JS_DOCS_LINK',
  STARTER_GUIDE_NEAR_CLI_DOCS_LINK = 'STARTER_GUIDE_NEAR_CLI_DOCS_LINK',
  STARTER_GUIDE_NEAR_SDK_JS_DOCS_LINK = 'STARTER_GUIDE_NEAR_SDK_JS_DOCS_LINK',
  TELEGRAM_DESTINATION_VERIFICATION_COPY_BOT_HANDLE_BUTTON = 'TELEGRAM_DESTINATION_VERIFICATION_COPY_BOT_HANDLE_BUTTON',
  TELEGRAM_DESTINATION_VERIFICATION_COPY_MESSAGE_BUTTON = 'TELEGRAM_DESTINATION_VERIFICATION_COPY_MESSAGE_BUTTON',
  TELEGRAM_DESTINATION_VERIFICATION_OPEN_TELEGRAM_LINK = 'TELEGRAM_DESTINATION_VERIFICATION_OPEN_TELEGRAM_LINK',
  TOOLTIP_ACTION_BUTTON = 'TOOLTIP_ACTION_BUTTON',
  TRANSACTION_ACTIONS_RESPONSE_EXPAND_BUTTON = 'TRANSACTION_ACTIONS_RESPONSE_EXPAND_BUTTON',
  TRIGGERED_ALERT_BACK_TO_ACTIVITY_LINK = 'TRIGGERED_ALERT_BACK_TO_ACTIVITY_LINK',
  TRIGGERED_ALERT_BLOCK_HASH_LINK = 'TRIGGERED_ALERT_BLOCK_HASH_LINK',
  TRIGGERED_ALERT_COPY_BLOCK_HASH_BUTTON = 'TRIGGERED_ALERT_COPY_BLOCK_HASH_BUTTON',
  TRIGGERED_ALERT_COPY_RECEIPT_ID_BUTTON = 'TRIGGERED_ALERT_COPY_RECEIPT_ID_BUTTON',
  TRIGGERED_ALERT_COPY_TRANSACTION_HASH_BUTTON = 'TRIGGERED_ALERT_COPY_TRANSACTION_HASH_BUTTON',
  TRIGGERED_ALERT_EDIT_LINK = 'TRIGGERED_ALERT_EDIT_LINK',
  TRIGGERED_ALERT_RECEIPT_ID_LINK = 'TRIGGERED_ALERT_RECEIPT_ID_LINK',
  TRIGGERED_ALERT_TRANSACTION_HASH_LINK = 'TRIGGERED_ALERT_TRANSACTION_HASH_LINK',
  TRIGGERED_ALERTS_ALERT_FILTER_DROPDOWN = 'TRIGGERED_ALERTS_ALERT_FILTER_DROPDOWN',
  TRIGGERED_ALERTS_CREATE_ALERT_LINK = 'TRIGGERED_ALERTS_CREATE_ALERT_LINK',
  TRIGGERED_ALERTS_LIVE_UPDATES_SWITCH = 'TRIGGERED_ALERTS_LIVE_UPDATES_SWITCH',
  TUTORIAL_CONTENT_CODE_BLOCK_GITHUB_LINK = 'TUTORIAL_CONTENT_CODE_BLOCK_GITHUB_LINK',
  TUTORIAL_CONTENT_COMPLETE_BUTTON = 'TUTORIAL_CONTENT_COMPLETE_BUTTON',
  TUTORIAL_CONTENT_LINK = 'TUTORIAL_CONTENT_LINK',
  TUTORIAL_CONTENT_NEXT_STEP_LINK = 'TUTORIAL_CONTENT_NEXT_STEP_LINK',
  TUTORIAL_CONTENT_TABLE_OF_CONTENTS_LINK = 'TUTORIAL_CONTENT_TABLE_OF_CONTENTS_LINK',
  TUTORIAL_TYPE_BACK_TO_PROJECT_TYPE_LINK = 'TUTORIAL_TYPE_BACK_TO_PROJECT_TYPE_LINK',
  TX_FORM_DEPOSIT_INPUT = 'TX_FORM_DEPOSIT_INPUT',
  TX_FORM_FUNCTION_PARAMS_INPUT = 'TX_FORM_FUNCTION_PARAMS_INPUT',
  TX_FORM_FUNCTION_SELECT = 'TX_FORM_FUNCTION_SELECT',
  TX_FORM_GAS_INPUT = 'TX_FORM_GAS_INPUT',
  UI_DOCS_EXAMPLE = 'UI_DOCS_EXAMPLE',
  UPLOAD_CONTRACT_ABI_MODAL_CHOOSE_FILE_BUTTON = 'UPLOAD_CONTRACT_ABI_MODAL_CHOOSE_FILE_BUTTON',
  UPLOAD_CONTRACT_ABI_MODAL_CHOOSE_FILE_INPUT = 'UPLOAD_CONTRACT_ABI_MODAL_CHOOSE_FILE_INPUT',
  UPLOAD_CONTRACT_ABI_MODAL_NEAR_ABI_DOCS_LINK = 'UPLOAD_CONTRACT_ABI_MODAL_NEAR_ABI_DOCS_LINK',
  UPLOAD_CONTRACT_ABI_MODAL_UPLOAD_CLIPBOARD_BUTTON = 'UPLOAD_CONTRACT_ABI_MODAL_UPLOAD_CLIPBOARD_BUTTON',
  UPLOAD_CONTRACT_ABI_NEAR_ABI_DOCS_LINK = 'UPLOAD_CONTRACT_ABI_NEAR_ABI_DOCS_LINK',
  UPLOAD_CONTRACT_ABI_OPEN_UPLOAD_MODAL_BUTTON = 'UPLOAD_CONTRACT_ABI_OPEN_UPLOAD_MODAL_BUTTON',
  USER_DROPDOWN = 'USER_DROPDOWN',
  USER_SETTINGS_DISPLAY_NAME_INPUT = 'USER_SETTINGS_DISPLAY_NAME_INPUT',
  USER_SETTINGS_EDIT_BUTTON = 'USER_SETTINGS_EDIT_BUTTON',
  USER_SETTINGS_OPEN_DELETE_ACCOUNT_MODAL_BUTTON = 'USER_SETTINGS_OPEN_DELETE_ACCOUNT_MODAL_BUTTON',
  USER_SETTINGS_SAVE_BUTTON = 'USER_SETTINGS_SAVE_BUTTON',
  WALLET_ACCOUNT_ID_COPY_BUTTON = 'WALLET_ACCOUNT_ID_COPY_BUTTON',
  WEBHOOK_DESTINATION_SECRET_COPY_SECRET_BUTTON = 'WEBHOOK_DESTINATION_SECRET_COPY_SECRET_BUTTON',
  WEBHOOK_DESTINATION_SECRET_ROTATE_SECRET_BUTTON = 'WEBHOOK_DESTINATION_SECRET_ROTATE_SECRET_BUTTON',
}
