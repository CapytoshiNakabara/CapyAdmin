import {
    Pagination as ShadCnPagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { useMemo } from "react"

interface Props {
    currentPage: number
    onChange: (newPage: number) => void
    pageSize: number
    totalCount: number
}

export const Pagination = ({ currentPage, onChange, pageSize, totalCount }: Props) => {

    const renderPagination = useMemo(() => {
        const totalPageCount = Math.ceil(totalCount / pageSize) - 1;

        if (currentPage < 3) {
            return <>
                {currentPage !== 0 && <PaginationItem>
                    <PaginationPrevious onClick={() => onChange(currentPage - 1)} />
                </PaginationItem>}
                <PaginationItem>
                    <PaginationLink onClick={() => onChange(0)} isActive={currentPage === 0}>1</PaginationLink>
                </PaginationItem>
                {totalCount > 1 * pageSize && <PaginationItem>
                    <PaginationLink onClick={() => onChange(1)} isActive={currentPage === 1}>2</PaginationLink>
                </PaginationItem>}
                {totalCount > 2 * pageSize && <PaginationItem>
                    <PaginationLink onClick={() => onChange(2)} isActive={currentPage === 2}>3</PaginationLink>
                </PaginationItem>}
                {totalCount > 2 * pageSize &&
                    <>
                        <PaginationItem>
                            <PaginationEllipsis onClick={() => onChange(totalPageCount)} />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink onClick={() => onChange(totalPageCount)}>{totalPageCount}</PaginationLink>
                        </PaginationItem>
                    </>
                }
                <PaginationItem>
                    <PaginationNext onClick={() => onChange(currentPage + 1)} />
                </PaginationItem>
            </>
        }
        else if (currentPage >= totalPageCount - 2) {
            return <>
                <PaginationItem>
                    <PaginationPrevious onClick={() => onChange(currentPage - 1)} />
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink onClick={() => onChange(0)}>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink onClick={() => onChange(totalPageCount - 2)} isActive={currentPage === totalPageCount - 2}>{totalPageCount - 2}</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink onClick={() => onChange(totalPageCount - 1)} isActive={currentPage === totalPageCount - 1}>{totalPageCount - 1}</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink onClick={() => onChange(totalPageCount)} isActive={currentPage === totalPageCount}>{totalPageCount}</PaginationLink>
                </PaginationItem>
                {currentPage !== totalPageCount && <PaginationItem>
                    <PaginationNext onClick={() => onChange(currentPage + 1)} />
                </PaginationItem>}
            </>
        }
        else {
            return <>
                <PaginationItem>
                    <PaginationPrevious onClick={() => onChange(currentPage - 1)} />
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink onClick={() => onChange(0)}>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink onClick={() => onChange(currentPage - 1)}>{currentPage}</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink onClick={() => onChange(currentPage)} isActive>{currentPage + 1}</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink onClick={() => onChange(currentPage + 1)}>{currentPage + 2}</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationEllipsis onClick={() => onChange(totalPageCount)} />
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink onClick={() => onChange(totalPageCount)}>{totalPageCount}</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationNext onClick={() => onChange(currentPage + 1)} />
                </PaginationItem>
            </>
        }

    }, [totalCount, pageSize, currentPage])

    return (
        <ShadCnPagination>
            <PaginationContent>
                {renderPagination}
            </PaginationContent>
        </ShadCnPagination>
    )
}