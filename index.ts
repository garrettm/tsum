export type Pattern<U, B> = {[K in keyof U]: (a: U[K]) => B}
export type Pattern2<U, B, C> = {[K in keyof U]: (a: U[K], b: B) => C}
export type Pattern3<U, B, C, D> = {[K in keyof U]: (a: U[K], b: B, c: C) => D}
export type Pattern4<U, B, C, D, E> = {[K in keyof U]: (a: U[K], b: B, c: C, d: D) => E}
export type Pattern5<U, B, C, D, E, F> = {[K in keyof U]: (a: U[K], b: B, c: C, d: D, e: E) => F}

export type TypeOf<U> = (_: U[keyof U]) => (keyof U) | null

export interface Is<U> {
  <T extends keyof U>(typename: T): (_: U[keyof U]) => _ is U[T]
  <T extends keyof U>(typename: T, _: U[keyof U]): _ is U[T]
}

export interface Sum<U> {
  types?: U[keyof U]
  names?: keyof U

  is: Is<U>

  typeOf: TypeOf<U>

  match: <B>(a: U[keyof U], p: Pattern<U, B>) => B

  f: <B>(p: Pattern<U, B>) => ((a: U[keyof U]) => B) & Pattern<U, B>

  f2: <B, C>(p: Pattern2<U, B, C>) => ((a: U[keyof U], b: B) => C) & Pattern2<U, B, C>

  f3: <B, C, D>(p: Pattern3<U, B, C, D>) => ((a: U[keyof U], b: B, c: C) => D) & Pattern3<U, B, C, D>

  f4: <B, C, D, E>(p: Pattern4<U, B, C, D, E>) => ((a: U[keyof U], b: B, c: C, d: D) => E) & Pattern4<U, B, C, D, E>

  f5: <B, C, D, E, F>(p: Pattern5<U, B, C, D, E, F>) => ((a: U[keyof U], b: B, c: C, d: D, e: E) => F) & Pattern5<U, B, C, D, E, F>
}

export type SumWithPhantoms<U> = Sum<U> & Partial<U>

export type Extend<A> = <Methods>(extension: (prev: A) => Methods) => A & Methods & Extendable<A & Methods>
export interface Extendable<U> {
  extend: Extend<U>
}
export type SumExtendable<U> = SumWithPhantoms<U> & Extendable<SumWithPhantoms<U>>

export interface SumInput<U> {
  typeOf: TypeOf<U>
}

export const Sum = <U extends {[key: string]: any}>(input: SumInput<U>) => {
  type TypeNames = keyof U
  type A = U[TypeNames]
  const {typeOf} = input

  const functions: Sum<U> = {
    is: function(typename: TypeNames, _?: A) {
      return arguments.length === 2 ? typeOf(_) === typename : (_: A) => typeOf(_) === typename
    } as any,

    typeOf,

    match: <B>(a: A, p: Pattern<U, B>): B => {
      return p[typeOf(a)](a)
    },

    f: <B>(p: Pattern<U, B>): ((a: A) => B) & Pattern<U, B> => {
      const match1 = (a: A): B => {
        return p[typeOf(a)](a)
      }
      return spreadInto(match1, p)
    },

    f2: <B, C>(p: Pattern2<U, B, C>): ((a: A, b: B) => C) & Pattern2<U, B, C> => {
      const match2 = (a: A, b: B): C => {
        return p[typeOf(a)](a, b)
      }
      return spreadInto(match2, p)
    },

    f3: <B, C, D>(p: Pattern3<U, B, C, D>): ((a: A, b: B, c: C) => D) & Pattern3<U, B, C, D> => {
      const match3 = (a: A, b: B, c: C): D => {
        return p[typeOf(a)](a, b, c)
      }
      return spreadInto(match3, p)
    },

    f4: <B, C, D, E>(p: Pattern4<U, B, C, D, E>): ((a: A, b: B, c: C, d: D) => E) & Pattern4<U, B, C, D, E> => {
      const match4 = (a: A, b: B, c: C, d: D): E => {
        return p[typeOf(a)](a, b, c, d)
      }
      return spreadInto(match4, p)
    },

    f5: <B, C, D, E, F>(p: Pattern5<U, B, C, D, E, F>): ((a: A, b: B, c: C, d: D, e: E) => F) & Pattern5<U, B, C, D, E, F> => {
      const match5 = (a: A, b: B, c: C, d: D, e: E): F => {
        return p[typeOf(a)](a, b, c, d, e)
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
