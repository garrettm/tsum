export type Pattern<U, B> = {[K in keyof U]: (a: U[K]) => B}
export type Pattern2<U, B, C> = {[K in keyof U]: (a: U[K], b: B) => C}
export type Pattern3<U, B, C, D> = {[K in keyof U]: (a: U[K], b: B, c: C) => D}
export type Pattern4<U, B, C, D, E> = {[K in keyof U]: (a: U[K], b: B, c: C, d: D) => E}
export type Pattern5<U, B, C, D, E, F> = {[K in keyof U]: (a: U[K], b: B, c: C, d: D, e: E) => F}

export type Match<U, B> = ((a: U[keyof U]) => B) & Pattern<U, B>
export type Match2<U, B, C> = ((a: U[keyof U], b: B) => C) & Pattern2<U, B, C>
export type Match3<U, B, C, D> = ((a: U[keyof U], b: B, c: C) => D) & Pattern3<U, B, C, D>
export type Match4<U, B, C, D, E> = ((a: U[keyof U], b: B, c: C, d: D) => E) & Pattern4<U, B, C, D, E>
export type Match5<U, B, C, D, E, F> = ((a: U[keyof U], b: B, c: C, d: D, e: E) => F) & Pattern5<U, B, C, D, E, F>

export type TypeOf<U> = (_: U[keyof U]) => (keyof U) | undefined

export type Predicates<U> = {[K in keyof U]: (arg: U[K]) => boolean}
export type PredicateProducer<U> = (predicates: typeof Predicates) => Predicates<U>

export const never = (_: any) => false
export const is = (_: any) => _ !== null && _ !== undefined
export const isString = (_: any): _ is string => typeof _ === 'string'
export const isBoolean = (_: any): _ is boolean => typeof _ === 'boolean'
export const isNumber = (_: any): _ is number => typeof _ === 'number'
export const isFunction = (_: any): _ is Function => typeof _ === 'function'
export const isPrimitive = (_: any): _ is string | number | boolean => typeof _ !== 'object'
export const isArray = Array.isArray
export const isArrayOf = <T>(pred: (arg: any) => arg is T) => (_: any): _ is T[] => {
  if (!Array.isArray(_)) { return false }
  for (const x of (_ as any[])) {
    if (!pred(x)) { return false }
  }
  return true
}
export const isObject = (_: any): _ is Object => typeof _ === 'object' && _ !== null
export const isRecordOf = <U>(predicateMap: Predicates<U>) => {
  const keys = Object.keys(predicateMap) as any as (keyof U)[]
  const predicates = keys.map(key => predicateMap[key])
  const {length} = keys

  return (_: any): _ is U => {
    if (!_) { return false }
    for (let i = 0; i < length; i++) {
      if (!predicates[i](_[keys[i]])) { return false }
    }
    return true
  }
}
export const Predicates = {
  never, is, isString, isBoolean, isNumber, isFunction,
  isPrimitive, isArray, isArrayOf, isObject, isRecordOf
}

export interface Is<U> {
  <T extends keyof U>(typename: T): (_: U[keyof U]) => _ is U[T]
  <T extends keyof U>(typename: T, _: U[keyof U]): _ is U[T]
}

export interface Sum<U> {
  types: U[keyof U]
  names: keyof U

  is: Is<U>

  typeOf: TypeOf<U>

  match: <B>(a: U[keyof U], p: Pattern<U, B>) => B

  f: <B>(p: Pattern<U, B>) => Match<U, B>
  f2: <B, C>(p: Pattern2<U, B, C>) => Match2<U, B, C>
  f3: <B, C, D>(p: Pattern3<U, B, C, D>) => Match3<U, B, C, D>
  f4: <B, C, D, E>(p: Pattern4<U, B, C, D, E>) => Match4<U, B, C, D, E>
  f5: <B, C, D, E, F>(p: Pattern5<U, B, C, D, E, F>) => Match5<U, B, C, D, E, F>
}

export type SumWithPhantoms<U> = Sum<U> & Partial<U>

export type Extend<A> = <Methods>(extension: (prev: A) => Methods) => A & Methods & Extendable<A & Methods>
export interface Extendable<U> {
  extend: Extend<U>
}
export type SumExtendable<U> = SumWithPhantoms<U> & Extendable<SumWithPhantoms<U>>

export type SumInput<U> = {typeOf: TypeOf<U>} | {predicates: Predicates<U> | PredicateProducer<U>}

export const Sum = <U extends {[key: string]: any}>(input: SumInput<U>) => {
  type TypeNames = keyof U
  type A = U[TypeNames]
  type TypePred = (a: A) => boolean

  let typeOf: TypeOf<U>
  let unroll = false
  let keys: TypeNames[]
  let predicates: TypePred[] = []
  let one = never, two = never, three = never, four = never, five = never
  let six = never, seven = never, eight = never, nine = never, ten = never
  const failf = (): never => { throw new TypeError() }

  if (isFunction((input as any).typeOf)) {
    typeOf = (input as any).typeOf
  }
  else {
    const predicatesInput: Predicates<U> = (input as any).predicates
    let predicateMap: Predicates<U>
      if (Predicates.isFunction(predicatesInput)) {
        predicateMap = predicatesInput(Predicates)
      }
    else {
      predicateMap = predicatesInput
    }

    keys = Object.keys(predicateMap)
    predicates = keys.map(key => predicateMap[key])
    const cases = keys.length
    unroll = cases <= 10
    const [onek, twok, threek, fourk, fivek, sixk,
           sevenk, eightk, ninek, tenk] = keys;

    [one, two, three, four, five, six, seven, eight, nine, ten] = predicates

    typeOf = input => {
      if (one(input)) { return onek }
      if (two(input)) { return twok }
      if (three(input)) { return threek }
      if (four(input)) { return fourk }
      if (five(input)) { return fivek }
      if (six(input)) { return sixk }
      if (seven(input)) { return sevenk }
      if (eight(input)) { return eightk }
      if (nine(input)) { return ninek }
      if (ten(input)) { return tenk }
      for (let i = 10; i < cases; i++) {
        if (predicates[i](input)) { return keys[i] }
      }
      throw new TypeError()
    }
  }

  const keyOf = typeOf as (a: A) => TypeNames

  const functions: Sum<U> = {
    types: undefined as any,
    names: undefined as any,

    is: function(typename: TypeNames, _?: A) {
      return arguments.length === 2 ? typeOf(_) === typename : (_: A) => typeOf(_) === typename
    } as any,

    typeOf,

    match: <B>(a: A, p: Pattern<U, B>): B => {
      return p[keyOf(a)](a)
    },

    f: <B>(p: Pattern<U, B>): Match<U, B> => {
      let match1: (a: A) => B
      if (unroll) {
        const [onef = failf, twof = failf, threef = failf,
               fourf = failf, fivef = failf, sixf = failf,
               sevenf = failf, eightf = failf, ninef = failf,
               tenf = failf] = keys.map(k => p[k])

        match1 = a => {
          if (one(a)) { return onef(a) }
          if (two(a)) { return twof(a) }
          if (three(a)) { return threef(a) }
          if (four(a)) { return fourf(a) }
          if (five(a)) { return fivef(a) }
          if (six(a)) { return sixf(a) }
          if (seven(a)) { return sevenf(a) }
          if (eight(a)) { return eightf(a) }
          if (nine(a)) { return ninef(a) }
          if (ten(a)) { return tenf(a) }
          throw new TypeError()
        }
      }
      else {
        match1 = a => p[keyOf(a)](a)
      }
      return spreadInto(match1, p)
    },

    f2: <B, C>(p: Pattern2<U, B, C>): Match2<U, B, C> => {
      let match2: (a: A, b: B) => C
      if (unroll) {
        const [onef = failf, twof = failf, threef = failf,
               fourf = failf, fivef = failf, sixf = failf,
               sevenf = failf, eightf = failf, ninef = failf,
               tenf = failf] = keys.map(k => p[k])

        match2 = (a, b) => {
          if (one(a)) { return onef(a, b) }
          if (two(a)) { return twof(a, b) }
          if (three(a)) { return threef(a, b) }
          if (four(a)) { return fourf(a, b) }
          if (five(a)) { return fivef(a, b) }
          if (six(a)) { return sixf(a, b) }
          if (seven(a)) { return sevenf(a, b) }
          if (eight(a)) { return eightf(a, b) }
          if (nine(a)) { return ninef(a, b) }
          if (ten(a)) { return tenf(a, b) }
          throw new TypeError()
        }
      }
      else {
        match2 = (a, b) => p[keyOf(a)](a, b)
      }
      return spreadInto(match2, p)
    },

    f3: <B, C, D>(p: Pattern3<U, B, C, D>): Match3<U, B, C, D> => {
      let match3: (a: A, b: B, c: C) => D
      if (unroll) {
        const [onef = failf, twof = failf, threef = failf,
               fourf = failf, fivef = failf, sixf = failf,
               sevenf = failf, eightf = failf, ninef = failf,
               tenf = failf] = keys.map(k => p[k])

        match3 = (a, b, c) => {
          if (one(a)) { return onef(a, b, c) }
          if (two(a)) { return twof(a, b, c) }
          if (three(a)) { return threef(a, b, c) }
          if (four(a)) { return fourf(a, b, c) }
          if (five(a)) { return fivef(a, b, c) }
          if (six(a)) { return sixf(a, b, c) }
          if (seven(a)) { return sevenf(a, b, c) }
          if (eight(a)) { return eightf(a, b, c) }
          if (nine(a)) { return ninef(a, b, c) }
          if (ten(a)) { return tenf(a, b, c) }
          throw new TypeError()
        }
      }
      else {
        match3 = (a, b, c) => p[keyOf(a)](a, b, c)
      }
      return spreadInto(match3, p)
    },

    f4: <B, C, D, E>(p: Pattern4<U, B, C, D, E>): Match4<U, B, C, D, E> => {
      let match4: (a: A, b: B, c: C, d: D) => E
      if (unroll) {
        const [onef = failf, twof = failf, threef = failf,
               fourf = failf, fivef = failf, sixf = failf,
               sevenf = failf, eightf = failf, ninef = failf,
               tenf = failf] = keys.map(k => p[k])

        match4 = (a, b, c, d) => {
          if (one(a)) { return onef(a, b, c, d) }
          if (two(a)) { return twof(a, b, c, d) }
          if (three(a)) { return threef(a, b, c, d) }
          if (four(a)) { return fourf(a, b, c, d) }
          if (five(a)) { return fivef(a, b, c, d) }
          if (six(a)) { return sixf(a, b, c, d) }
          if (seven(a)) { return sevenf(a, b, c, d) }
          if (eight(a)) { return eightf(a, b, c, d) }
          if (nine(a)) { return ninef(a, b, c, d) }
          if (ten(a)) { return tenf(a, b, c, d) }
          throw new TypeError()
        }
      }
      else {
        match4 = (a, b, c, d) => p[keyOf(a)](a, b, c, d)
      }
      return spreadInto(match4, p)
    },

    f5: <B, C, D, E, F>(p: Pattern5<U, B, C, D, E, F>): Match5<U, B, C, D, E, F> => {
      let match5: (a: A, b: B, c: C, d: D, e: E) => F
      if (unroll) {
        const [onef = failf, twof = failf, threef = failf,
               fourf = failf, fivef = failf, sixf = failf,
               sevenf = failf, eightf = failf, ninef = failf,
               tenf = failf] = keys.map(k => p[k])

        match5 = (a, b, c, d, e) => {
          if (one(a)) { return onef(a, b, c, d, e) }
          if (two(a)) { return twof(a, b, c, d, e) }
          if (three(a)) { return threef(a, b, c, d, e) }
          if (four(a)) { return fourf(a, b, c, d, e) }
          if (five(a)) { return fivef(a, b, c, d, e) }
          if (six(a)) { return sixf(a, b, c, d, e) }
          if (seven(a)) { return sevenf(a, b, c, d, e) }
          if (eight(a)) { return eightf(a, b, c, d, e) }
          if (nine(a)) { return ninef(a, b, c, d, e) }
          if (ten(a)) { return tenf(a, b, c, d, e) }
          throw new TypeError()
        }
      }
      else {
        match5 = (a, b, c, d, e) => p[keyOf(a)](a, b, c, d, e)
      }
      return spreadInto(match5, p)
    }
  }

  const summation: Sum<U> & Partial<U> = functions as any
  summation.extend = extend<typeof summation, U>(summation)
  return summation as any as Sum<U> & Partial<U> & Extendable<typeof summation>
}

const spreadInto = (into: any, from: any) => {
  const keys = Object.keys(from)
  for (const key of keys) {
    into[key] = from[key]
  }
  return into
}

const extend = <A extends Sum<U>, U>(prev: A): Extend<A> => {
  return <Methods>(extension: (prev: A) => Methods) => {
    const next = {...(prev as any), ...(extension(prev) as any)}
    next.extend = extend(next)
    return next as A & Methods & Extendable<A & Methods>
  }
}

export default Sum
