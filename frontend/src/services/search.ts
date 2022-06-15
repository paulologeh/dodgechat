import { fetcher } from 'utils'

const API_URI = `${process.env.API_URI}/api`

export class Search {
  static search(term: string) {
    return fetcher(`${API_URI}/search?term=${term}`, 'GET')
  }
}
