export const CATALOGUE_SYNC_KEY = "sr_store_catalogue_sync";

export const emitCatalogueSync = () => {
  localStorage.setItem(CATALOGUE_SYNC_KEY, `${Date.now()}`);
};
