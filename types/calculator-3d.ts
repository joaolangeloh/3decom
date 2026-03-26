export type AmazonFulfillmentType = 'fba' | 'dba'

export interface Amazon3DSettings {
  fulfillmentType: AmazonFulfillmentType
  categoryId: string
  installmentsEnabled: boolean
}
