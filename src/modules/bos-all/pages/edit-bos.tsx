import { useEffect } from "react";
import usePermissions from "auth/permissions/hooks/usePermissions";
import { AccessTypes, SettingsModules } from "auth/permissions/enums";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "store";
import UnauthorizedContent from "core/components/UnauthorizedContent";
import { LoadingButton } from "@mui/lab";
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { FormProvider, useForm } from "react-hook-form";
import { isFulfilled } from "@reduxjs/toolkit";
import { setPageTitle } from "core/layouts/layoutSlice";
import { BosUpdates } from "../types";
import { updateBosInfo, getBosInfoById } from "../bosSlice";
import ErrorView from "core/components/ShowError";
import { FuelType } from "core/types/db-enum";
import moment from "moment";

const EditBos = () => {
  const entity = "BOS/AOS/POL/DI/AHS";
  const {bosId} = useParams<"bosId">();
  const dispatch: AppDispatch = useDispatch();
  const { can } = usePermissions();
  const formMethods = useForm<BosUpdates>();
  const { handleSubmit, register, setValue, watch } = formMethods;

  const updateBosLoading = useSelector(
    (state: RootState) => state.bos.updateStatus === "pending"
  );
  
  const detailStatus = useSelector(
    (state: RootState) => state.bos.getDetailStatus
  );

  useEffect(() => {
    dispatch(setPageTitle(`Edit ${entity}`));
  }, [dispatch]);

  const onSubmitUpdateBos = async (values: BosUpdates) => {
    if (bosId) {
      console.log(moment(values.tripDate).local().format(), values.tripDate);
      const dataUpdate = {
        id: parseInt(bosId),
        tripDate: values.tripDate,
        meterReading: +values.meterReading,
        startTime: moment(moment(values.startTime, ["h:m a", "H:m"]).format())
          .utc()
          .format(),
        endTime: moment(moment(values.endTime, ["h:m a", "H:m"]).format())
          .utc()
          .format(),
        fuelRecieved: +values.fuelRecieved,
        fuelType: values.fuelType ? values.fuelType : undefined
      };
      const updateBosAction = await dispatch(updateBosInfo(dataUpdate));
      if (isFulfilled(updateBosAction)) {
        navigate("/e-boc-trip");
      }
    };
  };

  useEffect(() => {
    if (bosId) {
      dispatch(getBosInfoById(parseInt(bosId)))
        .unwrap()
        .then((data: any) => {
          console.log(moment(data.tripDate).local().format("YYYY-MM-DD"), moment(data.tripDate).utc().format("YYYY-MM-DD"))
          setValue("tripDate", moment(data.tripDate).utc().format("YYYY-MM-DD"))
          setValue("startTime", moment.utc(data.eLog.startTime).local().format("HH:mm"))
          setValue("endTime", moment.utc(data.eLog.endTime).local().format("HH:mm"))
          setValue("meterReading", data.eLog.meterReading ?? null)
          setValue("fuelRecieved", data.eLog.fuelReceived ?? null)
          setValue("fuelType", data.eLog.fuelType ?? "")
        });
    }
  }, [dispatch, bosId, setValue])


  const navigate = useNavigate();

  if (detailStatus === "failed")
    return (
      <ErrorView
        title={`Loading Failed!`}
        desc={`There has been a problem while getting ${entity} data from the database. Try again or Please contact administration!`}
      />
    );
  
    if (can(AccessTypes.UPDATE, SettingsModules.BOS_AOS_POL_DI_AHS)) {
      return (
        <Box sx={{ flexGrow: 1 }}>
          <h2 style={{ paddingLeft: 30 }}>Edit {entity}</h2>
          <FormProvider {...formMethods}>
            <form onSubmit={handleSubmit(onSubmitUpdateBos)}>
              <Grid container columns={{ xs: 4, sm: 8, md: 12 }}>
                <Grid item xs={12} md={6} sx={{ pl: 2, pr: 6, pt: 3 }}>
                  <FormControl sx={{ width: "100%" }} variant={"filled"}>
                    <TextField
                      label="Trip Date"
                      placeholder="Enter Trip date"
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "100%" }}
                      required
                      type={"date"}
                      {...register("tripDate")}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6} sx={{ pl: 2, pr: 6, pt: 3 }}>
                  <FormControl sx={{ width: "100%" }} variant={"filled"}>
                    <TextField
                      label="Meter Reading"
                      placeholder="Enter meter reading"
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "100%" }}
                      type={"text"}
                      required
                      {...register("meterReading", { pattern: /^(0|[1-9]\d*)(\.\d+)?$/ })}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6} sx={{ pl: 2, pr: 6, pt: 3 }}>
                  <FormControl sx={{ width: "100%" }} variant={"filled"}>
                    <TextField
                      label="Start Time"
                      placeholder="Enter Start time"
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "100%" }}
                      required
                      type={"time"}
                      {...register("startTime")}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6} sx={{ pl: 2, pr: 6, pt: 3 }}>
                  <FormControl sx={{ width: "100%" }} variant={"filled"}>
                    <TextField
                      label="End Time"
                      placeholder="Enter End time"
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "100%" }}
                      required
                      type={"time"}
                      {...register("endTime")}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6} sx={{ pl: 2, pr: 6, pt: 3 }}>
                  <FormControl sx={{ width: "100%" }} variant={"filled"}>
                    <TextField
                      label="Fuel Recieved"
                      placeholder="Enter fuel recieved"
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "100%" }}
                      type={"text"}
                      {...register("fuelRecieved", { pattern: /^(0|[1-9]\d*)(\.\d+)?$/ })}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6} sx={{ pl: 2, pr: 6, pt: 3 }}>
                  <FormControl sx={{ width: "100%" }}>
                    <InputLabel id="fuel-type-select-label">Fuel Type</InputLabel>
                    <Select
                      labelId="fuel-type-select-label"
                      label="Fuel Type"
                      placeholder="Select fuel type"
                      sx={{ width: "100%" }}
                      value={watch("fuelType") || ""}
                      {...register("fuelType")}
                    >
                      <MenuItem key={"empty"} value={""}>
                        Select Fuel Type
                      </MenuItem>
                      {Object.keys(FuelType).map((key) => (
                        <MenuItem key={key} value={key}>
                          {key}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
  
                <Grid item xs={12} md={12} sx={{ pl: 2, pr: 6, pt: 3 }}>
                  <Box display="flex" justifyContent="flex-end" pt={2}>
                    <LoadingButton
                      variant="contained"
                      loading={updateBosLoading}
                      disabled={updateBosLoading}
                      type="submit"
                    >
                      {"Update"}
                    </LoadingButton>
                    <Button
                      variant={"outlined"}
                      style={{ alignSelf: "end" }}
                      onClick={() => navigate("/e-boc-trip")}
                      disabled={updateBosLoading}
                      disableElevation
                      sx={{ ml: 2 }}
                    >
                      {"Cancel"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </FormProvider>
        </Box>
      )
    }
    return <UnauthorizedContent />;
}
export default EditBos;
