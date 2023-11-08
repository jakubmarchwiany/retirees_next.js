import { Checkbox, FormControlLabel, Typography } from "@mui/material";
import { LocalizationProvider, MobileDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/pl";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

type Props = {
	startDate: Dayjs | undefined;
	setStartDate: Dispatch<SetStateAction<Dayjs | undefined>>;
	endDate: Dayjs | undefined;
	setEndDate: Dispatch<SetStateAction<Dayjs | undefined>>;
};

export default function DateForm({
	startDate,
	setStartDate,
	endDate,
	setEndDate
}: Props): JSX.Element {
	const [isEndDateEnable, setIsEndDateEnable] = useState<boolean>(false);

	useEffect(() => {
		if (endDate !== undefined) {
			setIsEndDateEnable(true);
		}
	}, []);

	return (
		<LocalizationProvider adapterLocale="pl" dateAdapter={AdapterDayjs}>
			<Typography mt={2} textAlign="center" variant="h4">
				Data
			</Typography>
			<MobileDatePicker
				defaultValue={startDate}
				minDate={dayjs()}
				onChange={(newValue): void => {
					newValue && setStartDate(newValue);
				}}
				sx={{ mt: 1 }}
			/>
			<FormControlLabel
				control={
					<Checkbox
						checked={isEndDateEnable}
						onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
							setIsEndDateEnable(event.target.checked);

							if (!event.target.checked) {
								setEndDate(undefined);
							}
						}}
					/>
				}
				label="Data końcowa (opcjonalne)"
				sx={{ mt: 1 }}
			/>
			{isEndDateEnable && (
				<MobileDatePicker
					defaultValue={endDate}
					minDate={startDate}
					onChange={(newValue): void => {
						newValue && setEndDate(newValue);
					}}
					sx={{ mt: 1 }}
				/>
			)}
		</LocalizationProvider>
	);
}