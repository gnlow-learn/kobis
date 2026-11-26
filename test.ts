import { daily, weekly } from "./mod.ts"

const key = Deno.env.get("KOBIS_KEY")
if (!key) throw new Error("KOBIS_KEY is not set in .env")

const day = await daily({ key, itemPerPage: 10, repNationCd: "K" })
console.log(day.boxOfficeResult.boxofficeType, day.boxOfficeResult.showRange)
console.table(day.boxOfficeResult.dailyBoxOfficeList.map((r) => ({
    rank: r.rank,
    delta: r.rankInten,
    title: r.movieNm,
    audi: r.audiCnt,
    acc: r.audiAcc,
})))

const week = await weekly({ key, targetDt: "20261119", weekGb: "1", itemPerPage: 10 })
console.log(week.boxOfficeResult.boxofficeType, week.boxOfficeResult.showRange, week.boxOfficeResult.yearWeekTime)
console.table(week.boxOfficeResult.weeklyBoxOfficeList.map((r) => ({
    rank: r.rank,
    delta: r.rankInten,
    title: r.movieNm,
    audi: r.audiCnt,
    acc: r.audiAcc,
})))
