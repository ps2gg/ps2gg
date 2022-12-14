import request from 'axios'

export class CensusQuery {
  private _collectionName: string
  private _awaitingCollection = true
  private _awaitingCondition = false
  private _isFirstParam = true
  public baseUrl = `http://census.daybreakgames.com/s:ps2gg/get/ps2:v2/`
  public composedUrl: string

  public async get(url = this.composedUrl, retries = 0): Promise<any> {
    return this.fetch(url, retries)
  }

  public collection(collection: string): this {
    if (!this._awaitingCollection)
      throw new Error(`Collection is already set to ${this._collectionName}.`)
    this._collectionName = collection
    this.composedUrl = this.baseUrl + collection
    this._awaitingCollection = false
    return this
  }

  public start(start: number): this {
    return this.addParam(`c:start=${start}`)
  }

  public limit(limit: number): this {
    return this.addParam(`c:limit=${limit}`)
  }

  public show(fields: string): this {
    return this.addParam(`c:show=${this._createParamString(fields)}`)
  }

  public hide(fields: string): this {
    return this.addParam(`c:hide=${this._createParamString(fields)}`)
  }

  public sort(fields: string): this {
    return this.addParam(`c:sort=${this._createParamString(fields)}`)
  }

  public resolve(fields: string): this {
    return this.addParam(`c:resolve=${this._createParamString(fields)}`)
  }

  public case(bool: boolean): this {
    return this.addParam(`c:case=${bool}`)
  }

  public includeNull(bool: boolean): this {
    return this.addParam(`c:includeNull=${bool}`)
  }

  public lang(lang: string): this {
    return this.addParam(`c:lang=${lang}`)
  }

  public timing(bool: boolean): this {
    return this.addParam(`c:timing=${bool}`)
  }

  public exactMatchFirst(bool: boolean): this {
    return this.addParam(`c:exactMatchFirst=${bool}`)
  }

  public distinct(field: string): this {
    return this.addParam(`c:distinct=${field}`)
  }

  public retry(bool: boolean): this {
    return this.addParam(`c:retry=${bool}`)
  }

  public join(args: JoinArgs): this {
    const joinString = `c:join=${this._createJoinQuery(args)}`
    return this.addParam(joinString)
  }

  private _createJoinQuery(args: JoinArgs): string {
    let joinString = ''
    let isFirst = true

    // for c:join=collection^...
    if (args.collection) {
      joinString += args.collection
      isFirst = false
    }

    for (const key in args) {
      if (key === 'join' || key === 'collection') continue
      if (!isFirst) {
        joinString += '^'
      } else {
        isFirst = false
      }

      joinString += `${key}:${this._createJoinString(args[key])}`
    }

    if (args.join) {
      joinString += `(${this._createJoinQuery(args.join)})`
    }

    return joinString
  }

  public where(field: string): this {
    return this.addParam(field, true)
  }

  public compare(operator: string, value: string | number): this {
    return this.addParam(operator + value, false, true)
  }

  public equals(value: string | number): this {
    return this.compare('=', value)
  }

  public notEquals(value: string | number): this {
    return this.compare('=!', value)
  }

  public lessThan(value: string | number): this {
    return this.compare('=<', value)
  }

  public lessThanEqual(value: string | number): this {
    return this.compare('=[', value)
  }

  public greaterThan(value: string | number): this {
    return this.compare('=>', value)
  }

  public greaterThanEqual(value: string | number): this {
    return this.compare('=]', value)
  }

  public startsWith(value: string | number): this {
    return this.compare('=^', value)
  }

  public contains(value: string | number): this {
    return this.compare('=*', value)
  }

  public addParam(param: string, isConditionStart = false, isConditionEnd = false): this {
    if (!this.collection) throw new Error('You need to query a collection first.')
    if (this._awaitingCondition && !isConditionEnd)
      throw new Error(`Incomplete condition: ${this.composedUrl}.`)
    if (isConditionStart) this._awaitingCondition = true
    if (isConditionEnd) this._awaitingCondition = false

    if (!isConditionEnd) {
      if (this._isFirstParam) {
        this.composedUrl += '?'
        this._isFirstParam = false
      } else {
        this.composedUrl += '&'
      }
    }

    this.composedUrl += param
    return this
  }

  // Some query params can take one or several arguments
  private _createParamString(obj): string {
    if (typeof obj === 'string') return obj
    else if (obj.constructor === Array) return obj.join(',')
    else if (!isNaN(obj)) return obj.toString() // eslint-disable-line
    else return ''
  }

  // Some join arg values can have multiple values
  private _createJoinString(obj): string {
    if (typeof obj === 'string') return obj
    else if (obj.constructor === Array) return obj.join("'")
    else if (!isNaN(obj)) return obj.toString() // eslint-disable-line
    else return ''
  }

  public async fetch(url: string, retries = 0): Promise<any> {
    if (!url) throw new Error('Census API query URL must not be empty.')

    try {
      const { data } = await request.get<any>(url)
      if (data.error) return { error: data.error }
      return data
    } catch (err) {
      if (retries >= 3) {
        return null
      }
      return this.get(url, ++retries)
    }
  }
}

type JoinArgs = {
  collection: string
  join: JoinArgs
}
