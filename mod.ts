import { z } from "https://esm.sh/zod@4.6.7"

const BASE = "https://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice"

const num = z.coerce.number()

const row = z.object({
    rnum: num,
    rank: num,
    rankInten: num,
    rankOldAndNew: z.enum(["OLD", "NEW"]),
    movieCd: z.string(),
    movieNm: z.string(),
    openDt: z.string(),
    salesAmt: num,
    salesShare: num,
    salesInten: num,
    salesChange: num,
    salesAcc: num,
    audiCnt: num,
    audiInten: num,
    audiChange: num,
    audiAcc: num,
    scrnCnt: num,
    showCnt: num,
})

const resultShape = {
    boxofficeType: z.string(),
    showRange: z.string(),
}

const dailyResult = z.object({
    boxOfficeResult: z.object({
        ...resultShape,
        dailyBoxOfficeList: z.array(row),
    }),
})

const weeklyResult = z.object({
    boxOfficeResult: z.object({
        ...resultShape,
        yearWeekTime: z.string(),
        weeklyBoxOfficeList: z.array(row),
    }),
})

const commonParams = {
    key: z.string().min(1),
    targetDt: z.string().regex(/^\d{8}$/, "expected yyyymmdd").optional(),
    itemPerPage: z.coerce.number().int().min(1).max(10).default(10),
    multiMovieYn: z.enum(["Y", "N"]).optional(),
    repNationCd: z.enum(["K", "F"]).optional(),
    wideAreaCd: z.string().regex(/^\d{10}$/).optional(),
}

const dailyParams = z.object(commonParams)

const weeklyParams = z.object({
    ...commonParams,
    weekGb: z.enum(["0", "1", "2"]).default("1"),
})

export type BoxOfficeItem = z.infer<typeof row>

const yesterdayKst =
(now: Date = new Date()) => {
    const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })
    return fmt.format(new Date(now.getTime() - 86_400_000)).replaceAll("-", "")
}

const normalize =
<T extends object>(input: T) => {
    const withDate = {
        ...input,
        targetDt: (input as { targetDt?: string }).targetDt ?? yesterdayKst(),
    }
    return Object.fromEntries(
        Object.entries(withDate).filter(([, v]) => v !== undefined && v !== ""),
    ) as Record<string, unknown>
}

const request =
async (path: string, params: Record<string, unknown>) => {
    const endpoint = new URL(`${BASE}/${path}.json`)
    for (const [k, v] of Object.entries(params)) endpoint.searchParams.set(k, String(v))

    const res = await fetch(endpoint)

    return (await res.json()) as unknown
}

export const daily =
async (input: z.input<typeof dailyParams>) => {
    const params = dailyParams.parse(normalize(input))
    return dailyResult.parse(await request("searchDailyBoxOfficeList", params))
}

export const weekly =
async (input: z.input<typeof weeklyParams>) => {
    const params = weeklyParams.parse(normalize(input))
    return weeklyResult.parse(await request("searchWeeklyBoxOfficeList", params))
}
